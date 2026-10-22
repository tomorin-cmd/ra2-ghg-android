import { TriggerExecutor } from '@/game/trigger/TriggerExecutor';

export class AllHuntExecutor extends TriggerExecutor {
    execute(context: any): void {
        context.campaignTeams?.allHunt();
    }
}
