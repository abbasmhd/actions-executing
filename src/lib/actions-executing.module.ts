import { NgModule, ModuleWithProviders } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { ActionsExecutedState } from './actions-executed.state';
import { ActionsExecutingState } from './actions-executing.state';
import { ActionsExecutedStatusState } from './actions-executed-status.state';
import { ActionsExecutedResultState } from './actions-executed-result.state';

@NgModule({
    imports: [
        NgxsModule.forFeature([
            ActionsExecutingState,
            ActionsExecutedState,
            ActionsExecutedStatusState,
            ActionsExecutedResultState
        ])
    ]
})
export class NgxsActionsExecutingModule {
    public static forRoot(): ModuleWithProviders<NgxsActionsExecutingModule> {
        return {
            ngModule: NgxsActionsExecutingModule
        };
    }
}
