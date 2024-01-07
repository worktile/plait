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
  </p>
  <h2>
    一款现代化的绘图框架用于构建一体化的白板工具产品 </br>
    比如思维导图、流程图、自由画笔等等
  </h3>
</div>


Plait 被定位为一个绘图框架，提供插件机制，允许开发者通过插件的方式扩展功能。它底层只提供一个基础的绘图白板，仅仅包含放大、缩小、移动画布等基础功能，而不包含任何业务功能，所有业务功能均需要通过插件的方式扩展，实现自由组合，可以方便的实现独立的或者一体化的绘图工具。

Plait 也会提供一些基础的功能插件，目前已经实现：

- 思维导图插件

- 流程图插件

- Flow 插件



Plait 架构以富文本编辑器框架 Slate 为灵感，用于 Web 端交互式绘图业务开发。

![online demo screen](https://github.com/worktile/plait/blob/develop/.docgeni/public/assets/mind-draw-flow.gif?raw=true)


- 👉 [在线示例 (流程图)](https://plait-gamma.vercel.app?init=draw)
- 👉 [在线示例 (思维导图)](https://plait-gamma.vercel.app?init=mind)
- 👉 [在线示例 (流程控制)](https://plait-gamma.vercel.app/flow)
- 👉 [在线文档](https://plait-docs.vercel.app)

#### 框架特性

- 提供基础画板能力，比如放大、缩小、移动
- 插件机制，提供插件机制用于扩展绘图功能
- 数据模型，提供基础数据模型及数据变换函数（支持协同）
- 前端组件化，基于组件组织业务逻辑（目前仅支持 Angular 框架）
- 基础绘图工具函数




#### 模块

|包名|说明
|---|---|
|@plait/core|框架核心：1.插件机制设计 2.提供数据模型、数据变换函数 3.提供基础的 board 组件，包含放大、缩小、滚动方案实现|
|@plait/common|不同绘图插件复用的一些逻辑：1.基础工具函数 2.基础插件 3.基础渲染逻辑|
|@plait/text|文本支持，依赖 slate 及 slate-angular|
|@plait/mind|思维导图插件实现，基于独立的自动布局算法，目前支持：逻辑布局、标准布局、缩进布局|
|@plait/draw|流程图插件实现，包括基础图形、标准流程图图形、连线、自由图片等元素交互式创建及修改|
|@plait/flow|Flow 插件，可以用于流程状态的可视化编排|
|@plait/layouts|思维导图支持库，包含自动布局算法|


#### 谁在使用

- 🔥🔥🔥 [PingCode Wiki](https://pingcode.com/solutions/knowledge-manage)


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
    (plaitBoardInitialized)="plaitBoardInitialized($event)" (plaitChange)="change($event)">
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

  change(event: PlaitBoardChangeEvent) {
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



