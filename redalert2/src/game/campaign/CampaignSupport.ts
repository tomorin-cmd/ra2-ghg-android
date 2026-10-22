import { MapFile } from '@/data/MapFile';
import { Rules } from '@/game/rules/Rules';
import { AiDifficulty, GameOpts } from '@/game/gameopts/GameOpts';

export interface CampaignHouse {
    name: string;
    country: string;
    parentCountry: string;
    side: string;
    color: string;
    credits: number;
    techLevel: number;
    playerControl: boolean;
    multiplayerPassive: boolean;
    allies: string[];
}

export interface CampaignInfo {
    playerHouse: CampaignHouse;
    houses: CampaignHouse[];
    briefingKey?: string;
}

/**
 * Minimal campaign-map detection and house/player setup for the Phase 1 PoC.
 *
 * Campaign maps are ordinary RA2 .map files, but they describe their own
 * houses/countries and pre-place units/buildings for those houses. Skirmish
 * setup creates players from the lobby slots instead, so we need to translate
 * the map's [Houses]/[Countries] sections into GameOpts and make map object
 * owners resolve by house name.
 */
export class CampaignSupport {
    static isCampaignMap(mapFile: MapFile): boolean {
        const basic = mapFile.getSection('Basic');
        if (!basic) {
            return false;
        }
        const briefing = basic.getString('Briefing');
        const player = basic.getString('Player');
        return Boolean(player && (briefing?.startsWith('Brief:') || basic.getString('Official') === 'yes'));
    }

    static read(mapFile: MapFile): CampaignInfo | undefined {
        if (!this.isCampaignMap(mapFile)) {
            return undefined;
        }
        const housesSection = mapFile.getSection('Houses');
        if (!housesSection) {
            return undefined;
        }
        const houses: CampaignHouse[] = [];
        for (const rawName of housesSection.entries.values()) {
            const name = String(rawName).trim();
            if (!name) {
                continue;
            }
            const section = mapFile.getSection(name);
            if (!section) {
                continue;
            }
            const country = section.getString('Country') || name.replace(/\s+House$/i, '');
            const countrySection = mapFile.getSection(country);
            const parentCountry = countrySection?.getString('ParentCountry') || country;
            houses.push({
                name,
                country,
                parentCountry,
                side: countrySection?.getString('Side') || '',
                color: section.getString('Color') || countrySection?.getString('Color') || '',
                credits: Number(section.getString('Credits') || 0),
                techLevel: Number(section.getString('TechLevel') || 10),
                playerControl: section.getString('PlayerControl')?.toLowerCase() === 'yes',
                multiplayerPassive: countrySection?.getString('MultiplayPassive')?.toLowerCase() === 'true',
                allies: (section.getString('Allies') || '')
                    .split(',')
                    .map((ally) => ally.trim())
                    .filter(Boolean),
            });
        }
        if (!houses.length) {
            return undefined;
        }
        const basic = mapFile.getSection('Basic')!;
        const preferredName = basic.getString('Player');
        const playerHouse = houses.find((house) => house.name === preferredName)
            ?? houses.find((house) => house.playerControl)
            ?? houses[0];
        return {
            playerHouse,
            houses,
            briefingKey: basic.getString('Briefing'),
        };
    }

    static getBriefingText(mapFile: MapFile, strings: any): string | undefined {
        const key = mapFile.getSection('Basic')?.getString('Briefing');
        if (!key) {
            return undefined;
        }
        const text = strings?.get?.(key);
        return text && text !== key ? text : undefined;
    }

    static getObjectives(mapFile: MapFile, strings: any): string[] {
        const text = this.getBriefingText(mapFile, strings);
        if (!text) {
            return [];
        }
        return text
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => /^(任務目標|任务目标|objective)/i.test(line) && /[：:]/.test(line));
    }

    static applyToGameOpts(mapFile: MapFile, gameOpts: GameOpts, rules: Rules): CampaignInfo | undefined {
        const info = this.read(mapFile);
        if (!info) {
            return undefined;
        }
        const countries = rules.getMultiplayerCountries();
        const colors = [...rules.getMultiplayerColors().keys()];
        const countryIndex = (house: CampaignHouse): number => {
            const candidates = [house.parentCountry, house.country].filter(Boolean);
            for (const candidate of candidates) {
                const index = countries.findIndex((country) => country.name.toLowerCase() === candidate.toLowerCase());
                if (index !== -1) {
                    return index;
                }
            }
            // Fallback: pick a country on the matching side.
            const sideIndex = countries.findIndex((country) => {
                const countryRules = rules.getCountry(country.name);
                return countryRules && ((house.side === 'GDI' && countryRules.side === 0) ||
                    (house.side === 'Nod' && countryRules.side === 1));
            });
            return Math.max(0, sideIndex);
        };
        const colorIndex = (house: CampaignHouse): number => {
            if (!house.color) {
                return 0;
            }
            const index = colors.findIndex((color) => color.toLowerCase() === house.color.toLowerCase());
            return index === -1 ? 0 : index;
        };
        const isPassive = (house: CampaignHouse): boolean =>
            /^(civilian|neutral)/i.test(house.country) ||
            /^(civie|neutral)/i.test(house.name);
        const playerCountry = countryIndex(info.playerHouse);
        const playerColor = colorIndex(info.playerHouse);
        const human = {
            name: info.playerHouse.name,
            countryId: playerCountry,
            colorId: playerColor,
            startPos: 0,
            teamId: 0,
        };
        const aiPlayers: any[] = [];
        let startPos = 1;
        let teamId = 1;
        for (const house of info.houses) {
            if (house === info.playerHouse || isPassive(house)) {
                continue;
            }
            const alliedWithPlayer = house.allies.some((ally) => ally.toLowerCase() === info.playerHouse.name.toLowerCase());
            aiPlayers.push({
                name: house.name,
                countryId: countryIndex(house),
                colorId: colorIndex(house),
                startPos: startPos++,
                teamId: alliedWithPlayer ? 0 : teamId++,
                difficulty: AiDifficulty.Medium,
            });
        }
        gameOpts.humanPlayers = [human];
        gameOpts.aiPlayers = aiPlayers;
        gameOpts.maxSlots = 1 + aiPlayers.length;
        gameOpts.campaign = true;
        gameOpts.campaignHouseByCountry = Object.fromEntries(
            info.houses.map((house) => [house.country, house.name]),
        );
        // Campaign maps pre-place their own units; do not generate a skirmish
        // starting army. Keep one MCV for the human player (created in Game).
        gameOpts.unitCount = 0;
        gameOpts.credits = Math.max(0, info.playerHouse.credits);
        gameOpts.mapTitle = gameOpts.mapTitle || info.playerHouse.name;
        console.log('[Campaign] Applied map houses', {
            player: human,
            ai: aiPlayers,
            houses: info.houses.length,
            briefing: info.briefingKey,
        });
        return info;
    }
}
