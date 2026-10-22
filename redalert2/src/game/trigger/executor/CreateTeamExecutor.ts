import { TriggerExecutor } from '@/game/trigger/TriggerExecutor';

export class CreateTeamExecutor extends TriggerExecutor {
    execute(context: any): void {
        const teamTypeId = String(this.action.params[1] ?? this.action.params[0] ?? '');
        if (!teamTypeId) {
            return;
        }
        context.campaignTeams?.createTeam(teamTypeId, this.trigger);
    }
}
