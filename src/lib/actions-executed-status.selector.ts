import { createSelector, getActionTypeFromInstance, ActionType } from '@ngxs/store';
import { ActionsExecutedStatusState, ActionsExecutedStatusStateModel } from './actions-executed-status.state';

export function actionsSucceeded(actionTypes: ActionType[]) {
    return createSelector([ActionsExecutedStatusState], (state: ActionsExecutedStatusStateModel) => {
        if (!actionTypes || actionTypes.length === 0) return state.success;
        return actionTypes.reduce((acc, type) => {
            const actionType = getActionTypeFromInstance(type);
            if (actionType && state.success[actionType]) {
                acc[actionType] = state.success[actionType];
            }
            return acc;
        }, {} as { [action: string]: number });
    });
}

export function actionsErrored(actionTypes: ActionType[]) {
    return createSelector([ActionsExecutedStatusState], (state: ActionsExecutedStatusStateModel) => {
        if (!actionTypes || actionTypes.length === 0) return state.error;
        return actionTypes.reduce((acc, type) => {
            const actionType = getActionTypeFromInstance(type);
            if (actionType && state.error[actionType]) {
                acc[actionType] = state.error[actionType];
            }
            return acc;
        }, {} as { [action: string]: number });
    });
}
