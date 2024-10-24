# @plait/angular-board

## 0.67.2

## 0.67.1

## 0.67.0

## 0.66.1

## 0.66.0

### Minor Changes

-   [#967](https://github.com/worktile/plait/pull/967) [`656f53e9a`](https://github.com/worktile/plait/commit/656f53e9a80f9151b9a69273481214e084673ca6) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - performance:

    1. use KEY_TO_ELEMENT_MAP cache the relation between element's key and element and use KEY_TO_ELEMENT_MAP in getElementById to optimize performance

    2. add replaceSelectedElement to take the place of the new selected element

## 0.65.2

## 0.65.1

## 0.65.0

### Minor Changes

-   [`e667a8e73`](https://github.com/worktile/plait/commit/e667a8e73033087daf672e773eb54da835439f11) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - upgrade angular into 18

## 0.65.0-next.0

### Minor Changes

-   [`3a69e449e`](https://github.com/worktile/plait/commit/3a69e449e758e4d5541855920e3309281e84605d) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - upgrade angular into 18

## 0.64.9

## 0.64.8

### Patch Changes

-   [`2c49d77f9`](https://github.com/worktile/plait/commit/2c49d77f910006b8b7aa763115b5707edfdbd8bc) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - invoking updateForeignObject will trigger auto scroll (browser default behavior) which cause board unexceptional scrolling

    so need remove updateForeignObject and invoke immediately onChange to avoid coming up shaking in drawnix

    prevent board children being covered when board is in FLUSHING

## 0.64.7

## 0.64.6

## 0.64.5

## 0.64.4

## 0.64.3

## 0.64.2

## 0.64.1

### Patch Changes

-   [`a48c04a95`](https://github.com/worktile/plait/commit/a48c04a959fa51d7dff41a0c6694837c13a4cc5a) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - fix emoji-icon(graph-viz plugin) can not show in safari browser (`transform: matrix(1, 0, 0, 1, 0, 0);` effect)

## 0.64.0

## 0.63.0

## 0.62.0

### Minor Changes

-   [#914](https://github.com/worktile/plait/pull/914) [`92436588f`](https://github.com/worktile/plait/commit/92436588fa95557474c8ebc0c282330376622fb4) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - Added `@plait/angular-board` package:

    1. Moved the board component from `@plait/core` to `@plait/angular-board`, core no longer depends on the angular framework
    2. Provided `renderComponent` method to dynamically render Angular components
    3. Implemented `renderText` method to dynamically render text components (angular-text)
    4. ...

    ***

    新增 `@plait/angular-board` 包：

    1. 将 board 组件从 `@plait/core` 移动到 `@plait/angular-board` 中, core 不再依赖 angular 框架
    2. 提供 `renderComponent` 方法实现动态渲染 Angular 组件
    3. 实现 `renderText` 方法实现动态渲染文本组件（angular-text）
    4. ...

### Patch Changes

-   [`be5c38689`](https://github.com/worktile/plait/commit/be5c3868965a05015bd1d4ae3326682f4b1851ad) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - handle apply error

    add getBoardComponentInjector to export injector

    resolve type error for common/utils/text.ts

*   [`7625c6cb2`](https://github.com/worktile/plait/commit/7625c6cb228fa66a408b00997a7b81d5fd9d8d6d) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - update peerDependencies

-   [`38ad91d93`](https://github.com/worktile/plait/commit/38ad91d9346f6ef39eddb264ddaa293bf219f93f) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add isSetSelectionOperation and isSetThemeOperation in operation interface

    remove add/remove className in updatePointerType and add className in angular-board component

*   [`d61621fef`](https://github.com/worktile/plait/commit/d61621fefdc3fd7fd8561dc28e22691c94488482) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add `user-select: none;` for foreignObject element to disabled use-select

    add class mark for image

## 0.62.0-next.10

## 0.62.0-next.9

### Patch Changes

-   [`7625c6cb2`](https://github.com/worktile/plait/commit/7625c6cb228fa66a408b00997a7b81d5fd9d8d6d) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - update peerDependencies

## 0.62.0-next.8

## 0.62.0-next.7

## 0.62.0-next.6

## 0.62.0-next.5

## 0.62.0-next.4

### Patch Changes

-   [`38ad91d93`](https://github.com/worktile/plait/commit/38ad91d9346f6ef39eddb264ddaa293bf219f93f) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add isSetSelectionOperation and isSetThemeOperation in operation interface

    remove add/remove className in updatePointerType and add className in angular-board component

## 0.62.0-next.3

## 0.62.0-next.2

### Patch Changes

-   [`be5c38689`](https://github.com/worktile/plait/commit/be5c3868965a05015bd1d4ae3326682f4b1851ad) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - handle apply error

    add getBoardComponentInjector to export injector

    resolve type error for common/utils/text.ts

## 0.62.0-next.1

### Patch Changes

-   [`d61621fef`](https://github.com/worktile/plait/commit/d61621fefdc3fd7fd8561dc28e22691c94488482) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add `user-select: none;` for foreignObject element to disabled use-select

    add class mark for image

## 0.62.0-next.0

### Minor Changes

-   [#914](https://github.com/worktile/plait/pull/914) [`92436588`](https://github.com/worktile/plait/commit/92436588fa95557474c8ebc0c282330376622fb4) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - Added `@plait/angular-board` package:

    1. Moved the board component from `@plait/core` to `@plait/angular-board`, core no longer depends on the angular framework
    2. Provided `renderComponent` method to dynamically render Angular components
    3. Implemented `renderText` method to dynamically render text components (angular-text)
    4. ...

    ***

    新增 `@plait/angular-board` 包：

    1. 将 board 组件从 `@plait/core` 移动到 `@plait/angular-board` 中, core 不再依赖 angular 框架
    2. 提供 `renderComponent` 方法实现动态渲染 Angular 组件
    3. 实现 `renderText` 方法实现动态渲染文本组件（angular-text）
    4. ...
