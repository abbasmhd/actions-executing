import { createSelector, getActionTypeFromInstance, ActionType } from '@ngxs/store';
import {
    ActionsExecutedResultState,
    ActionsExecutedResultStateModel,
    ActionResult
} from './actions-executed-result.state';

/**
 * Selector to get the last result (status) of one or more actions.
 *
 * @param actionTypes - An array of action classes or types to track.
 * @returns A selector that returns an object mapping action type to its last result:
 *   - 'dispatched': The action is currently running
 *   - 'success': The action completed successfully
 *   - 'error': The action failed
 *   - 'canceled': The action was canceled
 *   - null: The action has not been triggered yet
 */
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
