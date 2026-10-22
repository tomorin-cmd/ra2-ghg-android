import { TriggerExecutor } from '@/game/trigger/TriggerExecutor';

/** Placeholder executor for campaign actions that do not affect simulation yet. */
export class NoopExecutor extends TriggerExecutor {
    execute(): void {
        // Intentionally empty. Keep the action registered so the trigger does
        // not log "Unknown action type" and so we can implement it later.
    }
}
