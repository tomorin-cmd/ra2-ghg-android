import { MainMenuRoute } from '@/gui/screen/mainMenu/MainMenuRoute';
import { MainMenuScreenType } from '@/gui/screen/ScreenType';
import { AiDifficulty, GameOpts } from '@/game/gameopts/GameOpts';

interface MapListEntry {
    fileName: string;
    maxSlots: number;
    getFullMapTitle?(strings: any): string;
}

interface MapList {
    getAll(): MapListEntry[];
    getByName(name: string): MapListEntry | undefined;
}

interface GameMode {
    id: number;
}

interface GameModes {
    getAll(): GameMode[];
}

interface RootController {
    createGame(
        gameId: string,
        timestamp: number,
        gameServer: string,
        playerName: string,
        gameOpts: any,
        singlePlayer: boolean,
        tournament: boolean,
        mapTransfer: boolean,
        privateGame: boolean,
        returnTo: any,
    ): void;
}

export interface CampaignMission {
    map: string;
    label: string;
    side: 'tutorial' | 'allied' | 'soviet';
}

const ALLIED_MAPS = ['ALL01T', 'ALL02S', 'ALL03U', 'ALL04U', 'ALL05S', 'ALL06U',
    'ALL07T', 'ALL08U', 'ALL09T', 'ALL10S', 'ALL11T', 'ALL12S'];
const SOVIET_MAPS = ['SOV01T', 'SOV02T', 'SOV03U', 'SOV04S', 'SOV05U', 'SOV06T',
    'SOV07S', 'SOV08U', 'SOV09U', 'SOV10T', 'SOV11S', 'SOV12S'];

export const CAMPAIGN_MISSIONS: CampaignMission[] = [
    { map: 'TRN01T', label: '教学：基本训练', side: 'tutorial' },
    ...ALLIED_MAPS.map((map, index) => ({
        map,
        label: `盟军 ${String(index + 1).padStart(2, '0')}`,
        side: 'allied' as const,
    })),
    ...SOVIET_MAPS.map((map, index) => ({
        map,
        label: `苏军 ${String(index + 1).padStart(2, '0')}`,
        side: 'soviet' as const,
    })),
];

export function getNextCampaignMission(mapName: string): CampaignMission | undefined {
    const normalized = mapName.replace(/\.map$/i, '').toLowerCase();
    const current = CAMPAIGN_MISSIONS.find((mission) =>
        mission.map.toLowerCase() === normalized);
    if (!current) {
        return undefined;
    }
    if (current.side === 'tutorial') {
        return CAMPAIGN_MISSIONS.find((mission) => mission.map === 'ALL01T');
    }
    const pool = current.side === 'allied' ? ALLIED_MAPS : SOVIET_MAPS;
    const index = pool.findIndex((map) => map.toLowerCase() === normalized);
    if (index === -1 || index + 1 >= pool.length) {
        return undefined;
    }
    return CAMPAIGN_MISSIONS.find((mission) => mission.map === pool[index + 1]);
}

/**
 * Phase 1 debug launcher. The final campaign UI will replace this with a
 * mission list + briefing; for now the Home screen gets one button that loads
 * the tutorial campaign map through the normal single-player game path.
 */
export function startCampaignMission(
    rootController: RootController,
    mapList: MapList,
    gameModes: GameModes,
    mapName: string,
    strings?: any,
): boolean {
    const entry = mapList.getByName(mapName)
        ?? mapList.getAll().find((map) => map.fileName.toLowerCase() === mapName.toLowerCase())
        ?? mapList.getAll().find((map) => map.fileName.toLowerCase() === `${mapName.toLowerCase()}.map`);
    if (!entry) {
        console.warn('[Campaign] Map not found in map list', { mapName });
        return false;
    }
    const gameMode = gameModes.getAll()[0];
    if (!gameMode) {
        console.warn('[Campaign] No game mode available');
        return false;
    }
    const gameOpts: GameOpts = {
        gameMode: gameMode.id,
        gameSpeed: 1,
        credits: 5000,
        unitCount: 0,
        shortGame: false,
        superWeapons: true,
        buildOffAlly: false,
        mcvRepacks: false,
        cratesAppear: false,
        destroyableBridges: false,
        multiEngineer: false,
        noDogEngiKills: false,
        mapName: entry.fileName,
        mapTitle: entry.getFullMapTitle?.(strings) ?? entry.fileName,
        mapDigest: '',
        mapSizeBytes: 0,
        maxSlots: 2,
        mapOfficial: false,
        humanPlayers: [{
            name: '指挥官',
            countryId: 0,
            colorId: 0,
            startPos: 0,
            teamId: 0,
        }],
        aiPlayers: [{
            difficulty: AiDifficulty.Medium,
            countryId: 1,
            colorId: 1,
            startPos: 1,
            teamId: 1,
        }],
        campaign: true,
    };
    const timestamp = Math.floor(Date.now() / 1000) * 1000;
    rootController.createGame(
        '0',
        timestamp,
        '',
        '指挥官',
        gameOpts,
        true,
        false,
        false,
        false,
        new MainMenuRoute(MainMenuScreenType.Home),
    );
    return true;
}
