import { State, NgxsOnInit, StateContext, Actions, getActionTypeFromInstance, ActionStatus } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { OnDestroy, Injectable } from '@angular/core';

/**
 * Represents the last known status of an action.
 * - 'dispatched': The action is currently running
 * - 'success': The action completed successfully
 * - 'error': The action failed
 * - 'canceled': The action was canceled
 * - null: The action has not been triggered yet
 */
export type ActionResult = 'success' | 'error' | 'dispatched' | 'canceled' | null;

/**
 * State model mapping action type to its last result (status).
 */
export interface ActionsExecutedResultStateModel {
    [action: string]: ActionResult;
}

/**
 * NGXS state that tracks the last result (status) of each action.
 * Updates on every action status change (dispatched, success, error, canceled).
 */
@State<ActionsExecutedResultStateModel>({
    name: 'ngxs_actions_executed_result',
    defaults: {}
})
@Injectable()
export class ActionsExecutedResultState implements NgxsOnInit, OnDestroy {
    private sub: Subscription = new Subscription();

    constructor(private actions$: Actions) {}

    public ngxsOnInit({ patchState, getState }: StateContext<ActionsExecutedResultStateModel>) {
        this.sub = this.actions$
            .pipe(
                tap((actionContext) => {
                    const actionType = getActionTypeFromInstance(actionContext.action);
                    if (!actionType) return;

                    if (actionContext.status === ActionStatus.Dispatched) {
                        patchState({ [actionType]: 'dispatched' });
                    } else if (actionContext.status === ActionStatus.Successful) {
                        patchState({ [actionType]: 'success' });
                    } else if (actionContext.status === ActionStatus.Errored) {
                        patchState({ [actionType]: 'error' });
                    } else if (actionContext.status === ActionStatus.Canceled) {
                        patchState({ [actionType]: 'canceled' });
                    }
                })
            )
            .subscribe();
    }

    public ngOnDestroy() {
        this.sub.unsubscribe();
    }
}
