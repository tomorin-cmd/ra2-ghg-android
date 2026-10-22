import { TriggerExecutor } from '@/game/trigger/TriggerExecutor';

export class ReinforcementAtExecutor extends TriggerExecutor {
    execute(context: any): void {
        const teamTypeId = String(this.action.params[1] ?? '');
        const waypoint = String(this.action.params[6] ?? '');
        if (teamTypeId) {
            context.campaignTeams?.createTeam(teamTypeId, this.trigger, true, waypoint);
        }
    }
}
