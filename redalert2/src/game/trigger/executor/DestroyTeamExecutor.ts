import { TriggerExecutor } from '@/game/trigger/TriggerExecutor';

export class DestroyTeamExecutor extends TriggerExecutor {
    execute(context: any): void {
        const teamTypeId = String(this.action.params[1] ?? this.action.params[0] ?? '');
        if (teamTypeId) {
            context.campaignTeams?.destroyTeam(teamTypeId);
        }
    }
}
