# @plait/common


画图插件通用逻辑，在编写画图业务代码时如果发现插件间有一些可复用的逻辑，比如文本处理、图形渲染、图片渲染、Resize 交互、Creation 交互等等，则尝试将代码写在 `@plait/common` 中，方便复用。

`core` 核心逻辑，目前主要放置插件组件的基类

`generators` Generator 是抽象的一个概念，主要用于插件组件渲染和管理绘图元素，👉 [查看更多](https://plait-docs.vercel.app/guides/concepts/generator)

`plugins` 放置可复用的插件逻辑

`transforms` 通用的数据处理逻辑


#### 依赖
- `@plait/core`