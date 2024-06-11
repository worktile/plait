---
'@plait/draw': minor
'@plait/flow': minor
'@plait/mind': minor
---

Framework agnostic refactoring:

1. Use `measureElement` to measure text width and height

2. Use `text-manage` in `@plait/common` to render text

3. Provide an overridable method `renderEmoji` in `@plait/mind` to remove the dependency on Angular and transform the response generator

4. Provide an overridable method `renderLabelIcon` in `@plait/flow` to remove the dependency on Angular and transform the response generator

---

Framework agnostic 改造:

1. 改用 `measureElement` 测量文本宽高

2. 改用 `@plait/common` 中的 `text-manage` 实现文本的渲染

3. `@plait/mind` 中提供可重写方法 `renderEmoji` 解除对 Angular 的依赖，并且改造响应 generator

4. `@plait/flow` 中提供可重写方法 `renderLabelIcon` 解除对 Angular 的依赖，并且改造响应 generator
