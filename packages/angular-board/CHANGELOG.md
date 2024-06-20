# @plait/text-plugins

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
