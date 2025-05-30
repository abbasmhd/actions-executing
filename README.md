![master](https://github.com/ngxs-labs/actions-executing/workflows/main/badge.svg?branch=master)
[![npm version](https://badge.fury.io/js/%40ngxs-labs%2Factions-executing.svg)](https://badge.fury.io/js/%40ngxs-labs%2Factions-executing)
[![Coverage Status](https://coveralls.io/repos/github/ngxs-labs/actions-executing/badge.svg?branch=master)](https://coveralls.io/github/ngxs-labs/actions-executing?branch=master)

<p align="center">
  <img src="https://raw.githubusercontent.com/ngxs-labs/emitter/master/docs/assets/logo.png">
</p>

---

# NGXS Actions Executing

## Demo

[Link](https://ngxs-labs-actions-executing.netlify.app/)

## Description

This plugin allows you to easily know if an action is being executed and control UI elements or control flow of your
code to execute. The most common scenarios for using this plugin are to display loading spinner or disable a button
while an action is executing.

## Compatibility

| Angular | @ngxs-labs/actions-executing   |
| ------- | ------------------------------ |
| non-ivy | 0.x                            |
| ivy     | 1.x (compiled in partial mode) |

## Quick start

Install the plugin:

-   npm

```console
npm install --save @ngxs-labs/actions-executing
```

-   yarn

```console
yarn add @ngxs-labs/actions-executing
```

Next, include it in you `app.module.ts`

```ts
//...
import { NgxsModule } from '@ngxs/store';
import { NgxsActionsExecutingModule } from '@ngxs-labs/actions-executing';

@NgModule({
    //...
    imports: [
        //...
        NgxsModule.forRoot([
            //... your states
        ]),
        NgxsActionsExecutingModule.forRoot()
    ]
    //...
})
export class AppModule {}
```

To use it on your components you just need to include the following `@Select()`

```ts
//...
import { actionsExecuting, ActionsExecuting } from '@ngxs-labs/actions-executing';

//...
export class SingleComponent {
    @Select(actionsExecuting([MyAction])) myActionIsExecuting$: Observable<ActionsExecuting>;
}
```

then you can disable a button or display a loading indicator very easily

```html
<button [disabled]="myActionIsExecuting$ | async" (click)="doSomething()">
    My Action
</button>

<span *ngIf="myActionIsExecuting$ | async">
    Loading...
</span>
```

## More examples

`actionsExecuting` selector returns the type `ActionsExecuting`

```ts
type ActionsExecuting = { [action: string]: number } | null;
```

This allows you to know which actions and how many of them are being executed at any given time.

You can also pass multiple actions to the selector and this way you'll receive updates when any of those actions are
executing.

```ts
@Select(actionsExecuting([Action1, Action2])) multipleActions$: Observable<ActionsExecuting>;
```

## Tracking Success and Error States of Actions

You can also track whether actions have succeeded or failed (errored) using the `actionsSucceeded` and `actionsErrored`
selectors. This is useful for showing success/error messages or analytics.

**Usage in a component:**

```ts
import { actionsSucceeded, actionsErrored } from '@ngxs-labs/actions-executing';

@Select(actionsSucceeded([MyAction])) myActionSuccess$: Observable<{ [action: string]: number }>;
@Select(actionsErrored([MyAction])) myActionError$: Observable<{ [action: string]: number }>;
```

**Example UI integration:**

```html
<!-- Show a success message if the action succeeded at least once -->
<div *ngIf="(myActionSuccess$ | async)?.[MyAction.type]">
    Action succeeded!
</div>

<!-- Show an error message if the action failed at least once -->
<div *ngIf="(myActionError$ | async)?.[MyAction.type]">
    Action failed!
</div>
```

You can also pass multiple actions to the selectors to track multiple actions at once.

```ts
@Select(actionsSucceeded([Action1, Action2])) successCounts$: Observable<{ [action: string]: number }>;
@Select(actionsErrored([Action1, Action2])) errorCounts$: Observable<{ [action: string]: number }>;
```

## Tracking the Last Result of Actions (Success or Error)

You can use the `actionsResult` selector to know if an action was triggered and whether it last succeeded or errored.
This combines success and error tracking in a single observable.

**Usage in a component:**

```ts
import { actionsResult } from '@ngxs-labs/actions-executing';

@Select(actionsResult([MyAction])) myActionResult$: Observable<{ [action: string]: 'success' | 'error' | null }>;
```

**Example UI integration:**

```html
<div *ngIf="(myActionResult$ | async)?.[MyAction.type] === 'success'">
    Action succeeded!
</div>
<div *ngIf="(myActionResult$ | async)?.[MyAction.type] === 'error'">
    Action failed!
</div>
```

You can also pass multiple actions to the selector to track the last result for each:

```ts
@Select(actionsResult([Action1, Action2])) results$: Observable<{ [action: string]: 'success' | 'error' | null }>;
```
