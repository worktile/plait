---
'@plait/common': minor
'@plait/core': minor
---

Framework agnostic 改造:

1. 在 `@plait/common` 中重新实现 text-manage，通过提供可重写方法 renderText 解除和 Angular/React 等前端框架的强依赖
2. 在 `@plait/common` 中提供可重写方法 renderImage
3. 基于 `canvas` 实现 `measureElement` 方法，通过 `canvas` 的 `measureText` API 计算 Plait 中文本的宽和高，将原本调用 `getTextSize` 或者 `measureDivSize` 的地方全部改为调用 `measureElement`
4. 将 `@plait/core` 中依赖 Angular 的部分移入 `@plait/angular-board`
