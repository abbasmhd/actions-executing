import { NgxsActionsExecutingModule } from '..';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NgxsModule, Store, State, Action } from '@ngxs/store';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { actionsSucceeded, actionsErrored } from '../lib/actions-executed-status.selector';

describe('actionsExecutedStatus', () => {
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

    describe('Sync Action', () => {
        it('should count successful sync actions', () => {
            store.dispatch(new Action1());
            const snapshot = store.selectSnapshot(actionsSucceeded([Action1]));
            expect(snapshot).toEqual({ [Action1.type]: 1 });
        });

        it('should count errored sync actions', () => {
            store.dispatch(new ErrorAction1());
            const snapshot = store.selectSnapshot(actionsErrored([ErrorAction1]));
            expect(snapshot).toEqual({ [ErrorAction1.type]: 1 });
        });
    });

    describe('Async Action', () => {
        it('should count successful async actions', fakeAsync(() => {
            store.dispatch(new AsyncAction1());
            let snapshot = store.selectSnapshot(actionsSucceeded([AsyncAction1]));
            expect(snapshot).toEqual({}); // not completed yet
            tick();
            snapshot = store.selectSnapshot(actionsSucceeded([AsyncAction1]));
            expect(snapshot).toEqual({ [AsyncAction1.type]: 1 });
        }));

        it('should count errored async actions', fakeAsync(() => {
            store.dispatch(new AsyncErrorAction1()).subscribe({ error: () => {} });
            let snapshot = store.selectSnapshot(actionsErrored([AsyncErrorAction1]));
            expect(snapshot).toEqual({ [AsyncErrorAction1.type]: 1 }); // error is set immediately
            tick();
            snapshot = store.selectSnapshot(actionsErrored([AsyncErrorAction1]));
            expect(snapshot).toEqual({ [AsyncErrorAction1.type]: 1 });
        }));
    });
});
