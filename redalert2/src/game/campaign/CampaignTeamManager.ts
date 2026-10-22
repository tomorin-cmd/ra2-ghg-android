import { ObjectType } from '@/engine/type/ObjectType';
import { MoveOrder } from '@/game/order/MoveOrder';
import { TargetBridgeMode } from '@/game/Target';

/**
 * Minimal campaign TeamTypes/TaskForces runtime.
 *
 * This intentionally covers only the high-frequency trigger actions needed by
 * the first playable missions:
 *   4  Create Team
 *   5  Destroy Team
 *   6  All Hunt
 *   7  Reinforce
 *
 * ScriptTypes execution is not implemented yet; spawned teams are logged so the
 * remaining script actions can be added incrementally without changing trigger
 * parsing.
 */
export class CampaignTeamManager {
    private teams = new Map<string, any[]>();

    constructor(private game: any) {}

    createTeam(teamTypeId: string, trigger?: any, force: boolean = false, waypointOverride?: string | number): any[] {
        const teamSection = this.findTeamSection(teamTypeId);
        if (!teamSection) {
            console.warn('[Campaign] Team type not found', { teamTypeId, trigger: trigger?.name });
            return [];
        }
        const max = Number(teamSection.getString('Max') || 1);
        if (!force && max > 0) {
            const alive = (this.teams.get(teamTypeId) ?? []).filter((unit) => !unit.isDestroyed);
            if (alive.length > 0) {
                console.log('[Campaign] Team already active, skipping', {
                    teamTypeId,
                    name: teamSection.getString('Name'),
                    max,
                });
                return alive;
            }
        }
        const houseName = teamSection.getString('House');
        const owner = this.resolveOwner(houseName);
        if (!owner) {
            console.warn('[Campaign] Team owner not found', { teamTypeId, houseName });
            return [];
        }
        const taskForceId = teamSection.getString('TaskForce');
        const taskForceSection = taskForceId ? this.game.map.getIniSection(taskForceId) : undefined;
        if (!taskForceSection) {
            console.warn('[Campaign] TaskForce not found', { teamTypeId, taskForceId });
            return [];
        }
        const waypoint = waypointOverride !== undefined && waypointOverride !== ''
            ? this.decodeWaypoint(String(waypointOverride))
            : this.decodeWaypoint(teamSection.getString('Waypoint'));
        const startTile = this.game.map.getTileAtWaypoint(waypoint)
            ?? this.game.map.getTileAtWaypoint(0)
            ?? this.game.map.tiles.getByMapCoords(0, 0);
        if (!startTile) {
            console.warn('[Campaign] Team waypoint has no tile', { teamTypeId, waypoint });
            return [];
        }
        const units: any[] = [];
        let subCell = 0;
        for (const raw of taskForceSection.entries.values()) {
            const [rawCount, unitName] = String(raw).split(',').map((part) => part.trim());
            const count = Math.max(1, Number(rawCount) || 1);
            if (!unitName) {
                continue;
            }
            const type = this.resolveType(unitName);
            if (type === undefined) {
                console.warn('[Campaign] Unknown taskforce unit', { teamTypeId, unitName });
                continue;
            }
            for (let i = 0; i < count; i++) {
                try {
                    const rules = this.game.rules.getObject(unitName, type);
                    const unit = this.game.createUnitForPlayer(rules, owner);
                    unit.direction = 0;
                    if (type === ObjectType.Infantry) {
                        unit.position.subCell = subCell++ % 5;
                    }
                    unit.campaignTeamId = teamTypeId;
                    this.game.spawnObject(unit, startTile);
                    units.push(unit);
                }
                catch (error) {
                    console.warn('[Campaign] Failed to spawn team unit', { teamTypeId, unitName, error });
                }
            }
        }
        this.teams.set(teamTypeId, units);
        const scriptId = teamSection.getString('Script');
        this.runScript(scriptId, units);
        console.log('[Campaign] Created team', {
            teamTypeId,
            name: teamSection.getString('Name'),
            owner: owner.name,
            waypoint,
            units: units.map((unit) => unit.name),
            script: scriptId,
        });
        return units;
    }

    /**
     * Minimal ScriptTypes executor. It runs instant actions immediately and
     * waits for a move to finish before continuing to the next script line.
     */
    private runScript(scriptId: string, units: any[]): void {
        if (!scriptId || !units.length) {
            return;
        }
        const section = this.game.map.getIniSection(scriptId);
        if (!section) {
            console.warn('[Campaign] Script not found', { scriptId });
            return;
        }
        const steps = [...section.entries.entries()]
            .filter(([key]) => /^\d+$/.test(key))
            .sort(([a], [b]) => Number(a) - Number(b));
        this.runSteps(scriptId, steps, units, 0);
    }

    private runSteps(scriptId: string, steps: [string, any][], units: any[], index: number): void {
        if (index >= steps.length || this.game.status === 2) {
            return;
        }
        const alive = units.filter((unit) => !unit.isDestroyed);
        if (!alive.length) {
            return;
        }
        const [, raw] = steps[index];
        const [rawAction, rawParam] = String(raw).split(',').map((part) => part.trim());
        const action = Number(rawAction);
        const param = rawParam ?? '0';
        const next = () => this.runSteps(scriptId, steps, alive, index + 1);
        switch (action) {
            case 3: { // Move to waypoint
                const waypoint = this.decodeWaypoint(param);
                if (this.moveUnits(alive, waypoint)) {
                    this.waitForUnits(alive, next);
                    console.log('[Campaign] Script move', { scriptId, waypoint });
                }
                else {
                    next();
                }
                return;
            }
            case 1: { // Attack waypoint (approach for now)
                const waypoint = this.decodeWaypoint(param);
                if (this.moveUnits(alive, waypoint)) {
                    this.waitForUnits(alive, next);
                    console.log('[Campaign] Script attack-waypoint (approx move)', { scriptId, waypoint });
                }
                else {
                    next();
                }
                return;
            }
            case 16: { // Patrol to waypoint
                const waypoint = this.decodeWaypoint(param);
                if (this.moveUnits(alive, waypoint)) {
                    this.waitForUnits(alive, next);
                    console.log('[Campaign] Script patrol (approx move)', { scriptId, waypoint });
                }
                else {
                    next();
                }
                return;
            }
            case 20: // Change house ownership -> give to the local player
                for (const unit of alive) {
                    if (!unit.isDestroyed && unit.owner !== this.game.localPlayer) {
                        this.game.changeObjectOwner(unit, this.game.localPlayer);
                    }
                }
                console.log('[Campaign] Script give to player', { scriptId });
                next();
                return;
            case 8: // Unload
                console.log('[Campaign] Script unload', { scriptId });
                next();
                return;
            case 5: { // Guard area: wait for the requested time, then continue
                const ticks = Math.max(15, Number(param) * 15);
                this.waitTicks(ticks, next);
                return;
            }
            case 11: // Assign new mission: leave the current order and continue
                next();
                return;
            case 17: { // Change script; param is a ScriptTypes index
                const scriptTypes = this.game.map.getIniSection('ScriptTypes');
                const nextScriptId = scriptTypes?.getString(param) ?? param;
                const nextSection = this.game.map.getIniSection(nextScriptId);
                if (nextSection) {
                    const nextSteps = [...nextSection.entries.entries()]
                        .filter(([key]) => /^\d+$/.test(key))
                        .sort(([a], [b]) => Number(a) - Number(b));
                    this.runSteps(nextScriptId, nextSteps, alive, 0);
                }
                return;
            }
            case 18: { // Change team; param is a TeamTypes index
                const teamTypes = this.game.map.getIniSection('TeamTypes');
                const nextTeamId = teamTypes?.getString(param) ?? param;
                this.createTeam(nextTeamId, undefined, true);
                return;
            }
            case 23: // Force player loss
                if (this.game.localPlayer) {
                    this.game.localPlayer.defeated = true;
                }
                this.game.end();
                return;
            case 31: // Suicide
            case 37: // Delete team members
                for (const unit of alive) {
                    if (!unit.isDestroyed) {
                        this.game.destroyObject(unit, undefined, true);
                    }
                }
                return;
            case 39: // Local variable set
            case 40: // Local variable clear
                this.game.triggers?.toggleLocalVariable?.(param, action === 39);
                next();
                return;
            case 50: // Flash
            case 49: // Register success
            case 53: // Gather
            case 54: // Regroup
                next();
                return;
            default:
                console.warn('[Campaign] Unsupported script action', { scriptId, action, param });
                next();
                return;
        }
    }

    private waitTicks(ticks: number, callback: () => void): void {
        let remaining = ticks;
        const tick = () => {
            if (this.game.status === 2) {
                return;
            }
            if (--remaining <= 0) {
                callback();
            }
            else {
                this.game.afterTick(tick);
            }
        };
        this.game.afterTick(tick);
    }

    private waitForUnits(units: any[], callback: () => void): void {
        let ticks = 0;
        const check = () => {
            if (this.game.status === 2) {
                return;
            }
            const alive = units.filter((unit) => !unit.isDestroyed);
            if (!alive.length) {
                return;
            }
            ticks++;
            const idle = alive.every((unit) => !unit.unitOrderTrait || unit.unitOrderTrait.isIdle());
            if ((idle && ticks > 5) || ticks > 900) {
                callback();
            }
            else {
                this.game.afterTick(check);
            }
        };
        this.game.afterTick(check);
    }

    private moveUnits(units: any[], waypoint: number): boolean {
        const tile = this.game.map.getTileAtWaypoint(waypoint);
        if (!tile) {
            console.warn('[Campaign] Script waypoint has no tile', { waypoint });
            return false;
        }
        let issued = false;
        for (const unit of units) {
            if (unit.isDestroyed || !unit.unitOrderTrait) {
                continue;
            }
            try {
                const target = this.game.createTarget(undefined, tile, TargetBridgeMode.Auto);
                const order = new MoveOrder(this.game, this.game.map, this.game.getUnitSelection(), false)
                    .set(unit, target);
                unit.unitOrderTrait.addOrder(order);
                issued = true;
            }
            catch (error) {
                console.warn('[Campaign] Failed to issue script move', { waypoint, error });
            }
        }
        return issued;
    }

    destroyTeam(teamTypeId: string): void {
        const units = this.teams.get(teamTypeId);
        if (!units) {
            return;
        }
        for (const unit of units) {
            try {
                if (!unit.isDestroyed) {
                    this.game.destroyObject(unit, undefined, true);
                }
            }
            catch (error) {
                console.warn('[Campaign] Failed to destroy team unit', { teamTypeId, error });
            }
        }
        this.teams.delete(teamTypeId);
    }

    allHunt(): void {
        // The skirmish bot will engage on its own; this is a placeholder for
        // the original "all teams hunt" action.
        console.log('[Campaign] All Hunt');
    }

    private findTeamSection(teamTypeId: string): any {
        const direct = this.game.map.getIniSection(teamTypeId);
        if (direct) {
            return direct;
        }
        const teamTypes = this.game.map.getIniSection('TeamTypes');
        if (!teamTypes) {
            return undefined;
        }
        const byIndex = teamTypes.getString(teamTypeId);
        if (byIndex) {
            return this.game.map.getIniSection(byIndex);
        }
        for (const value of teamTypes.entries.values()) {
            if (String(value).toUpperCase() === teamTypeId.toUpperCase()) {
                return this.game.map.getIniSection(String(value));
            }
        }
        return undefined;
    }

    private resolveOwner(house: string): any {
        if (!house) {
            return this.game.localPlayer;
        }
        const mappedHouse = this.game.gameOpts.campaignHouseByCountry?.[house] ?? house;
        const players = this.game.playerList.getAll();
        return players.find((player: any) => player.name === mappedHouse)
            ?? players.find((player: any) => player.name === house)
            ?? players.find((player: any) => player.country?.name === house)
            ?? this.game.localPlayer;
    }

    private resolveType(unitName: string): ObjectType | undefined {
        for (const type of [ObjectType.Infantry, ObjectType.Vehicle, ObjectType.Aircraft]) {
            if (this.game.rules.hasObject(unitName, type)) {
                return type;
            }
        }
        return undefined;
    }

    private decodeWaypoint(value: string): number {
        if (!value) {
            return 0;
        }
        if (/^\d+$/.test(value)) {
            return Number(value);
        }
        let result = 0;
        for (const char of value.toUpperCase()) {
            if (char < 'A' || char > 'Z') {
                return 0;
            }
            result = result * 26 + (char.charCodeAt(0) - 64);
        }
        return Math.max(0, result - 1);
    }
}
