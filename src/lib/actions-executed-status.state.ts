import { State, NgxsOnInit, StateContext, Actions, getActionTypeFromInstance } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActionStatus } from '@ngxs/store/src/actions-stream';
import { OnDestroy, Injectable } from '@angular/core';

/**
 * State model for tracking the number of times each action has succeeded or errored.
 * - success: map of action type to success count
 * - error: map of action type to error count
 */
export interface ActionsExecutedStatusStateModel {
    success: { [action: string]: number };
    error: { [action: string]: number };
}

/**
 * NGXS state that tracks how many times each action has succeeded or errored.
 * Increments the count on each success or error event.
 */
@State<ActionsExecutedStatusStateModel>({
    name: 'ngxs_actions_executed_status',
    defaults: {
        success: {},
        error: {}
    }
})
@Injectable()
export class ActionsExecutedStatusState implements NgxsOnInit, OnDestroy {
    private sub: Subscription = new Subscription();

    constructor(private actions$: Actions) {}

    public ngxsOnInit({ patchState, getState }: StateContext<ActionsExecutedStatusStateModel>) {
        this.sub = this.actions$
            .pipe(
                tap((actionContext) => {
                    const actionType = getActionTypeFromInstance(actionContext.action);
                    if (!actionType) return;

                    const state = getState();
                    if (actionContext.status === ActionStatus.Successful) {
                        patchState({
                            success: {
                                ...state.success,
                                [actionType]: (state.success[actionType] || 0) + 1
                            }
                        });
                    } else if (actionContext.status === ActionStatus.Errored) {
                        patchState({
                            error: {
                                ...state.error,
                                [actionType]: (state.error[actionType] || 0) + 1
                            }
                        });
                    }
                })
            )
            .subscribe();
    }

    public ngOnDestroy() {
        this.sub.unsubscribe();
    }
}
