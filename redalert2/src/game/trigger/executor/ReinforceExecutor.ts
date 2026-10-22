import { TriggerExecutor } from '@/game/trigger/TriggerExecutor';

export class ReinforceExecutor extends TriggerExecutor {
    execute(context: any): void {
        const teamTypeId = String(this.action.params[1] ?? this.action.params[0] ?? '');
        if (teamTypeId) {
            context.campaignTeams?.createTeam(teamTypeId, this.trigger, true);
        }
    }
}
