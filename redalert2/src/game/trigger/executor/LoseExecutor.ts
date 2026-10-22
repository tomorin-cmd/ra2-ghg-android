import { TriggerExecutor } from '@/game/trigger/TriggerExecutor';

function resolveHousePlayer(context: any, houseId: number): any {
    return context.playerList.getCombatants()
        .find((player: any) => player.country?.id === houseId)
        ?? context.localPlayer;
}

/** Campaign action 2 (Lose). The second parameter is the losing house number. */
export class LoseExecutor extends TriggerExecutor {
    execute(context: any): void {
        const localPlayer = context.localPlayer;
        const houseId = Number(this.action.params[1] ?? 0);
        const loser = resolveHousePlayer(context, houseId) ?? localPlayer;
        if (loser) {
            loser.defeated = true;
        }
        console.log('[Campaign] Lose action', this.getDebugName(), {
            houseId,
            loser: loser?.name,
            localPlayer: localPlayer?.name,
        });
        context.end();
    }
}
