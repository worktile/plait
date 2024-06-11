---
'@plait/common': minor
'@plait/core': minor
---

Framework agnostic refactoring:

1. Reimplement text-manage in `@plait/common`, and remove the dependency on front-end frameworks such as Angular/React by providing an overridable method renderText

2. Provide an overridable method renderImage in `@plait/common`

3. Implement the `measureElement` method based on `canvas`, calculate the width and height of the text in Plait through the `measureText` API of `canvas`, and change all places that originally called `getTextSize` or `measureDivSize` to call `measureElement`

4. Move the part of `@plait/core` that depends on Angular to `@plait/angular-board`

---

Framework agnostic 改造:

1. 在 `@plait/common` 中重新实现 text-manage，通过提供可重写方法 renderText 解除和 Angular/React 等前端框架的强依赖
2. 在 `@plait/common` 中提供可重写方法 renderImage
3. 基于 `canvas` 实现 `measureElement` 方法，通过 `canvas` 的 `measureText` API 计算 Plait 中文本的宽和高，将原本调用 `getTextSize` 或者 `measureDivSize` 的地方全部改为调用 `measureElement`
4. 将 `@plait/core` 中依赖 Angular 的部分移入 `@plait/angular-board`
