const STORAGE_KEY = 'ra2_campaign_completed_v1';

function normalize(mapName: string): string {
    return mapName.replace(/\.map$/i, '').toUpperCase();
}

export function getCompletedCampaignMissions(): Set<string> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return new Set();
        }
        const parsed = JSON.parse(raw);
        return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
    }
    catch {
        return new Set();
    }
}

export function isCampaignMissionCompleted(mapName: string): boolean {
    return getCompletedCampaignMissions().has(normalize(mapName));
}

export function markCampaignMissionCompleted(mapName: string): void {
    try {
        const completed = getCompletedCampaignMissions();
        completed.add(normalize(mapName));
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
    }
    catch {
        // Best-effort only; campaign still works without persistence.
    }
}
