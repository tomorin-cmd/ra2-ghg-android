import { TriggerCondition } from '@/game/trigger/TriggerCondition';

/** Event 33: the attached object is selected by the local player. */
export class SelectedByPlayerCondition extends TriggerCondition {
    check(context: any): boolean {
        const selection = context.getUnitSelection?.();
        if (!selection || !this.targets.length) {
            return false;
        }
        return this.targets.some((target: any) => selection.isSelected(target));
    }
}
