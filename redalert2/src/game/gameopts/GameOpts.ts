export function isHumanPlayerInfo(info: any): boolean {
    // Campaign AI players also carry a house name, so presence of `name`
    // alone is no longer enough. AI entries always have a difficulty.
    return "name" in info && !("difficulty" in info);
}
export enum AiDifficulty {
    Brutal = 0,
    Medium = 1,
    Easy = 2,
    MediumSea = 3,
    Normal = 4,
    Custom = 5,
}
export interface HumanPlayerInfo {
    name: string;
    countryId: number;
    colorId: number;
    startPos: number;
    teamId: number;
}
export interface AiPlayerInfo {
    difficulty: AiDifficulty;
    customBotId?: string;
    countryId: number;
    colorId: number;
    startPos: number;
    teamId: number;
    /** Campaign house name (e.g. "BadGuy1 House"); defaults to an AI label. */
    name?: string;
}
export interface GameOpts {
    gameMode: number;
    gameSpeed: number;
    credits: number;
    unitCount: number;
    shortGame: boolean;
    superWeapons: boolean;
    buildOffAlly: boolean;
    mcvRepacks: boolean;
    cratesAppear: boolean;
    hostTeams?: boolean;
    destroyableBridges: boolean;
    multiEngineer: boolean;
    noDogEngiKills: boolean;
    mapName: string;
    mapTitle: string;
    mapDigest: string;
    mapSizeBytes: number;
    maxSlots: number;
    mapOfficial: boolean;
    humanPlayers: HumanPlayerInfo[];
    aiPlayers: (AiPlayerInfo | undefined)[];
    /** Campaign mode: spawn map-placed units and use campaign house setup. */
    campaign?: boolean;
    /** campaign country name (e.g. "Player") -> house name (e.g. "Player House"). */
    campaignHouseByCountry?: Record<string, string>;
    unknown?: string;
}
