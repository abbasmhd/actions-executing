import { NgxsActionsExecutingModule } from '..';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NgxsModule, Store, State, Action } from '@ngxs/store';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { actionsResult } from '../lib/actions-executed-result.selector';

describe('actionsExecutedResult', () => {
    let store: Store;

    class Action1 {
        static type = 'ACTION 1';
    }
    class ErrorAction1 {
        static type = 'ERROR ACTION 1';
    }
    class AsyncAction1 {
        static type = 'ASYNC ACTION 1';
    }
    class AsyncErrorAction1 {
        static type = 'ASYNC ERROR ACTION 1';
    }

    @State({ name: 'test' })
    @Injectable()
    class TestState {
        @Action([Action1])
        public action1() {}

        @Action([AsyncAction1])
        public asyncAction1() {
            return of({}).pipe(delay(0));
        }

        @Action(AsyncErrorAction1)
        public asyncError() {
            return throwError(new Error('test error')).pipe(delay(0));
        }

        @Action(ErrorAction1)
        public onError() {
            return throwError(new Error('test error'));
        }
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NgxsModule.forRoot([TestState]), NgxsActionsExecutingModule.forRoot()]
        });
        store = TestBed.inject(Store);
    });

    it('should be null before any action is dispatched', () => {
        const snapshot = store.selectSnapshot(actionsResult([Action1, ErrorAction1]));
        expect(snapshot).toEqual({ [Action1.type]: null, [ErrorAction1.type]: null });
    });

    it('should show success for a successful sync action', () => {
        store.dispatch(new Action1());
        const snapshot = store.selectSnapshot(actionsResult([Action1]));
        expect(snapshot).toEqual({ [Action1.type]: 'success' });
    });

    it('should show error for an errored sync action', () => {
        store.dispatch(new ErrorAction1());
        const snapshot = store.selectSnapshot(actionsResult([ErrorAction1]));
        expect(snapshot).toEqual({ [ErrorAction1.type]: 'error' });
    });

    it('should show success for a successful async action', fakeAsync(() => {
        store.dispatch(new AsyncAction1());
        let snapshot = store.selectSnapshot(actionsResult([AsyncAction1]));
        expect(snapshot).toEqual({ [AsyncAction1.type]: null }); // not completed yet
        tick();
        snapshot = store.selectSnapshot(actionsResult([AsyncAction1]));
        expect(snapshot).toEqual({ [AsyncAction1.type]: 'success' });
    }));

    it('should show error for an errored async action', fakeAsync(() => {
        store.dispatch(new AsyncErrorAction1()).subscribe({ error: () => {} });
        let snapshot = store.selectSnapshot(actionsResult([AsyncErrorAction1]));
        expect(snapshot).toEqual({ [AsyncErrorAction1.type]: 'error' }); // error is set immediately
        tick();
        snapshot = store.selectSnapshot(actionsResult([AsyncErrorAction1]));
        expect(snapshot).toEqual({ [AsyncErrorAction1.type]: 'error' });
    }));

    it('should update to the latest result for the same action', fakeAsync(() => {
        store.dispatch(new AsyncAction1());
        tick();
        let snapshot = store.selectSnapshot(actionsResult([AsyncAction1]));
        expect(snapshot).toEqual({ [AsyncAction1.type]: 'success' });
        store.dispatch(new AsyncErrorAction1()).subscribe({ error: () => {} });
        tick();
        snapshot = store.selectSnapshot(actionsResult([AsyncErrorAction1]));
        expect(snapshot).toEqual({ [AsyncErrorAction1.type]: 'error' });
    }));
});
