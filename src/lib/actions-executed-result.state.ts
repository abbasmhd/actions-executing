import { State, NgxsOnInit, StateContext, Actions, getActionTypeFromInstance } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActionStatus } from '@ngxs/store/src/actions-stream';
import { OnDestroy, Injectable } from '@angular/core';

export type ActionResult = 'success' | 'error' | 'dispatched' | 'canceled' | null;
export interface ActionsExecutedResultStateModel {
    [action: string]: ActionResult;
}

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
