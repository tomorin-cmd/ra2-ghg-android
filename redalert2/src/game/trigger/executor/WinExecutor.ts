import { TriggerExecutor } from '@/game/trigger/TriggerExecutor';

function resolveHousePlayer(context: any, houseId: number): any {
    return context.playerList.getCombatants()
        .find((player: any) => player.country?.id === houseId)
        ?? context.localPlayer;
}

/**
 * Campaign action 1 (Win). The second parameter is the winning house number.
 * If that house is the local player (or an ally), the local player wins;
 * otherwise the mission is a defeat for the local player.
 */
export class WinExecutor extends TriggerExecutor {
    execute(context: any): void {
        const localPlayer = context.localPlayer;
        const houseId = Number(this.action.params[1] ?? 0);
        const winner = resolveHousePlayer(context, houseId) ?? localPlayer;
        if (winner === localPlayer || context.alliances.areAllied(localPlayer, winner)) {
            if (!localPlayer.defeated) {
                for (const player of context.playerList.getCombatants()) {
                    if (player !== localPlayer && !context.alliances.areAllied(localPlayer, player)) {
                        player.defeated = true;
                    }
                }
            }
        }
        else {
            localPlayer.defeated = true;
            winner.defeated = false;
        }
        console.log('[Campaign] Win action', this.getDebugName(), {
            houseId,
            winner: winner?.name,
            localPlayer: localPlayer?.name,
        });
        context.end();
    }
}
