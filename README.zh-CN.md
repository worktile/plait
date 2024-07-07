<p align="center">
  <picture style="width: 320px">
    <source media="(prefers-color-scheme: light)" srcset="https://github.com/worktile/plait/blob/develop/.docgeni/public/assets/plait-logo-h.png?raw=true" />
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/worktile/plait/blob/develop/.docgeni/public/assets/plait-logo-h-dark.png?raw=true" />
    <img src="https://github.com/worktile/plait/blob/develop/.docgeni/public/assets/plait-horizontal-logo.png?raw=true" width="360" alt="Plait logo and name" />
  </picture>
</p>

<div align="center">
  <p>
    <a href="https://www.npmjs.com/package/@plait/core"><img src="https://img.shields.io/npm/dm/@plait/core.svg" alt="Total Downloads"></a>
    <a target="_blank" href="https://github.com/worktile/plait/releases/latest"><img src="https://img.shields.io/github/v/release/worktile/plait" /></a>
    <a target="_blank" href="https://github.com/worktile/plait/blob/develop/LICENSE"><img src="https://badgen.now.sh/badge/license/MIT" /></a>
    <a href="https://t.me/plaitboard"><img src="https://img.shields.io/badge/-Telegram-red?style=social&logo=telegram" height=20></a>
  </p>
  <h2>
    一款现代化的画图框架用于构建一体化的白板工具</br>
    实现如思维导图、流程图、自由画笔等交互式画图功能
  </h3>
</div>


Plait 是一款现代化的画图框架，提供插件机制，允许开发者通过插件的方式扩展画图功能，特别适用于交互式白板工具的开发。

Plait 底层不依赖任何前端 UI 框架，但是它为集成到主流的前端 UI 框架提供了解决方案，以保证上层开发者的开发体验、复用主流的框架组件。

当前已支持功能插件：

- 思维导图插件

- 流程图插件

- 知识图谱插件

- 流程编排插件

![online demo screen](https://github.com/worktile/plait/blob/develop/.docgeni/public/assets/mind-draw-flow.gif?raw=true)


- 👉 [在线示例 (流程图)](https://plait-gamma.vercel.app?init=draw)
- 👉 [在线示例 (思维导图)](https://plait-gamma.vercel.app?init=mind)
- 👉 [在线示例 (知识图谱)](https://plait-gamma.vercel.app/graph-viz?init=force-atlas)
- 👉 [在线示例 (流程控制)](https://plait-gamma.vercel.app/flow)
- 👉 [在线文档](https://plait-docs.vercel.app)

#### 框架特性

- 不依赖 UI 框架
- 提供基础画板能力，比如放大、缩小、移动
- 插件机制，提供插件机制用于扩展画图功能
- 数据模型，提供基础数据模型及数据变换函数（支持协同）
- 基础画图工具函数


#### UI 框架集成

框架落地需要以前端 UI 框架组件作为载体，这样可以保证画图图功能开发沿用主流开发模式进行（数据驱动），当前已支持 Angular 和 React 框架的集成。

Plait 中的文本渲染基于 Slate 框架，实现画板中富文本的渲染和编辑，Slate 是一款优秀的富文本编辑器框架，Plait 在设计上就是一 Slate 框架为灵感。


#### 模块

|包名|说明
|---|---|
|@plait/core|框架核心：插件机制设计、提供数据模型、数据变换函数、放大、缩小、滚动等方案|
|@plait/common|交互画图业务通用功能、文本渲染与编辑|
|@plait/text-plugins|文本扩展通用功能、UI 框架无关、依赖 Slate 富文本编辑器框架 |
|@plait/mind|思维导图插件，基于独立的自动布局算法，支持：逻辑布局、标准布局、缩进布局|
|@plait/draw|流程图插件，支持：基础图形、流程图图形、连线、自由图片等|
|@plait/flow|流程编排插件，支持：标准节点、连线、自定节点与连线|
|@plait/graph-viz|数据可视化插件，支持：知识图谱|
|@plait/layouts|思维导图布局算法|
|@plait/angular-text|文本渲染组件，依赖 Angular 框架、富文本编辑器框架 Slate、Angular 视图层|
|@plait/angular-board|白板视图层组件，依赖 Angular 框架|
|@plait/react-text|文本渲染组件，依赖 React 框架、富文本编辑器框架 Slate、React 视图层|
|@plait/react-board|白板视图层组件，依赖 React 框架|


React 视图层、文本渲染组件：[https://github.com/plait-board/drawnix](https://github.com/plait-board/drawnix)


#### 谁在使用

- 🔥🔥🔥 [PingCode Wiki](https://pingcode.com/solutions/knowledge-manage)
- 🔥 [Drawnix](https://github.com/plait-board/drawnix)


### 开发

```
npm i

npm run build

npm run start
```



### 使用

基本使用（集成 @plait/mind 插件）

HTML 模版：

```
<plait-board [plaitPlugins]="plugins" [plaitValue]="value"
    (plaitBoardInitialized)="plaitBoardInitialized($event)" (onChange)="change($event)">
</plait-board>
```

TS 文件：

```
// .ts
@Component({
  selector: 'board-basic',
  templateUrl: './board-basic.component.html',
  host: {
    class: 'board-basic-container',
  },
})
export class BasicBoardComponent {
  plugins = [withMind];

  value: PlaitElement[] = demoData;

  board!: PlaitBoard;

  change(event: OnChangeData) {
    // console.log(event.children);
  }

  plaitBoardInitialized(value: PlaitBoard) {
    this.board = value;
  }
}
```

更详细的示例说明参考：  [https://github.com/pubuzhixing8/plait-basic](https://github.com/pubuzhixing8/plait-basic)  



### 感谢

- [slate](https://github.com/ianstormtaylor/slate)

- [slate-angular](https://github.com/worktile/slate-angular)

- [rough](https://github.com/rough-stuff/rough)



### 贡献

欢迎大家贡献 Plait ，一起构建新一代的画图框架，任何的 Issue、PR 都是可以，也希望得到大家的 ⭐️ 支持。



### 开源协议

  [MIT License](https://github.com/worktile/slate-angular/blob/master/LICENSE)  



