import { TriggerExecutor } from '@/game/trigger/TriggerExecutor';
import { AllianceStatus } from '@/game/Alliances';

function resolveOwner(context: any, trigger: any): any {
    return context.getAllPlayers().find((player: any) => player.name === trigger.houseName)
        ?? context.getAllPlayers().find((player: any) => player.country?.name === trigger.houseName)
        ?? context.localPlayer;
}

function resolveTarget(context: any, houseId: number): any {
    return context.playerList.getCombatants()
        .find((player: any) => player.country?.id === houseId);
}

export class MakeAllyExecutor extends TriggerExecutor {
    execute(context: any): void {
        const owner = resolveOwner(context, this.trigger);
        const target = resolveTarget(context, Number(this.action.params[1]));
        if (owner && target && owner !== target && !context.alliances.areAllied(owner, target)) {
            const alliance = context.alliances.setAlliance(owner, target, AllianceStatus.Formed);
            context.onAllianceChange?.(alliance, owner, true);
        }
    }
}

export class MakeEnemyExecutor extends TriggerExecutor {
    execute(context: any): void {
        const owner = resolveOwner(context, this.trigger);
        const target = resolveTarget(context, Number(this.action.params[1]));
        if (owner && target && owner !== target && context.alliances.areAllied(owner, target)) {
            context.alliances.breakAlliance(owner, target);
            context.onAllianceChange?.(undefined, owner, false);
        }
    }
}
