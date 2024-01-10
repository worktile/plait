
## @plait/core

Plait 框架核心库，包含核心的数据模型、数据变换函数、插件机制等，除此之外还包含插件元素渲染基类以及包含基础白板交互的 board 组件。



> 当前 @plait/core 承担了过多的职责，既包含核心数据模型、插件机制，又包含了前端框架层的桥接层，还有一些绘图相关的基础功能插件，因为当前只要是一些基础的画板需求（比如框选、拖拽移动元素位置）都会在 core 中，未来可能会考虑更细的包划分。



####   **基础白板功能**

1. 提供一个画板组件（基于 Angular）
1. 放大、缩小、拖动画布
1. 集成画布滚动方案
1. 撤销、重做
1. 点选/拖选元素
1. 拖拽调整元素位置
1. 主题方案




#### **设计思路**

Plait 是为构建一体化的白板工具产品而设计的框架，它的核心是插件机制和数据模型。插件机制是外在表现，它允许开发者以插件的方式扩展白板功能，框架会提供必要的扩展桥梁和通讯机制为插件开发服务。数据模型是内核，它提供数据的定义及数据的操作变换函数，是插件的内在表示。



**插件机制**

插件机制基于可重写方法构建扩展桥梁，目前支持自定义交互、自定义渲染，在自定义交互方面 plait/core 目前以最原始的方式直接将基础的 DOM 事件定义为可重写方法，比如：pointerDown、pointerUp、pointerMove、keyDown、keyUp 等等，没有过多业务层面的封装，自定义渲染目前支持以 Angular 组件的方式扩展插件的渲染。



**数据模型**

主要提供以下能力：

1. 提供基础数据模型
1. 提供基于原子的数据变化方法（Transforms）
1. 基于不可变数据模型（基于 Immer）
1. 提供 Change 机制，与框架配合完成数据驱动渲染
1. 与插件机制融合，数据修改的过程可以被拦截处理




**标准数据流**

![data flow](https://github.com/worktile/plait/blob/develop/.docgeni/public/assets/packages/data-flow.png?raw=true)



#### **架构图**

![architecture diagram](https://github.com/worktile/plait/blob/develop/.docgeni/public/assets/packages/architecture-diagram.png?raw=true)



#### 依赖

- `roughjs`
- `is-hotkey`

