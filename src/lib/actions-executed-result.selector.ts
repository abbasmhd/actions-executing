import { createSelector, getActionTypeFromInstance, ActionType } from '@ngxs/store';
import {
    ActionsExecutedResultState,
    ActionsExecutedResultStateModel,
    ActionResult
} from './actions-executed-result.state';

export function actionsResult(actionTypes: ActionType[]) {
    return createSelector([ActionsExecutedResultState], (state: ActionsExecutedResultStateModel) => {
        if (!actionTypes || actionTypes.length === 0) return state;
        return actionTypes.reduce((acc, type) => {
            const actionType = getActionTypeFromInstance(type);
            acc[actionType] = state[actionType] ?? null;
            return acc;
        }, {} as { [action: string]: ActionResult });
    });
}
