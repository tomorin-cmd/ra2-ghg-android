import { TriggerCondition } from '@/game/trigger/TriggerCondition';

/**
 * Event 4/5: attached object or house has been seen by the local player.
 * Approximated by checking the local player's shroud over the targets.
 */
export class DiscoveredByPlayerCondition extends TriggerCondition {
    check(context: any): boolean {
        const shroud = context.mapShroudTrait?.getPlayerShroud(context.localPlayer);
        if (!shroud || !this.targets.length) {
            return false;
        }
        return this.targets.some((target: any) => {
            if (!target?.tile) {
                return false;
            }
            const tiles = target.isBuilding?.()
                ? context.map.tileOccupation.calculateTilesForGameObject(target.centerTile ?? target.tile, target)
                : [target.tile];
            return tiles.some((tile: any) => !shroud.isShrouded(tile, target.tileElevation ?? 0));
        });
    }
}

export class HouseDiscoveredCondition extends TriggerCondition {
    private houseId: number;

    constructor(event: any, trigger: any) {
        super(event, trigger);
        this.houseId = Number(event.params[1] ?? 0);
    }

    check(context: any): boolean {
        const shroud = context.mapShroudTrait?.getPlayerShroud(context.localPlayer);
        if (!shroud) {
            return false;
        }
        const house = context.playerList.getCombatants()
            .find((player: any) => player.country?.id === this.houseId);
        if (!house) {
            return false;
        }
        return house.getOwnedObjects(true).some((target: any) => {
            if (!target?.tile) {
                return false;
            }
            const tiles = target.isBuilding?.()
                ? context.map.tileOccupation.calculateTilesForGameObject(target.centerTile ?? target.tile, target)
                : [target.tile];
            return tiles.some((tile: any) => !shroud.isShrouded(tile, target.tileElevation ?? 0));
        });
    }
}
