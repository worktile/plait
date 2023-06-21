<p align="center">
  <picture style="width: 240px">
    <img src="https://github.com/worktile/plait/blob/develop/.docgeni/public/assets/plait-horizontal-logo.png?raw=true" width="500" alt="Plait logo and name" />
  </picture>
</p>

<div align="center">
  <h2>
    一款现代化的绘图框架用于构建一体化的白板工具 </br>
    比如思维导图、流程图、自由画笔等等
  </h3>
</div>


Plait 被定位为一个绘图框架，提供插件机制，允许开发者通过插件的方式扩展功能。它底层只提供一个基础的绘图白板，仅仅包含放大、缩小、移动端画布等基础功能，而不包含任何业务功能，所有业务功能均需要通过插件的方式扩展，实现自由组合，可以方便的实现独立的或者一体化的绘图工具。

Plait 也会提供一些基础的功能插件，目前已经实现了思维导图和状态流转两大功能插件，后续会实现流程图插件。

Plait 架构以富文本编辑器框架 Slate 为灵感，适用于交互式绘图场景，当前还在 beta 状态。

![online demo screen](https://github.com/worktile/plait/blob/develop/.docgeni/public/assets/screen-online-demo.png?raw=true)


- 👉 [在线示例 (白板)](https://plait.pingcode.com)
- 👉 [在线示例 (流程控制)](https://plait.pingcode.com/flow)


#### 框架特性

- 提供基础画板能力，比如放大、缩小、移动
- 插件机制，提供插件机制用于扩展绘图功能
- 数据模型，提供基础数据模型及数据变换函数（支持协同）
- 前端组件化，基于组件组织业务逻辑（目前仅支持 Angular 框架）




#### 模块

|Package Name|Description|Currently Version|
|---|---|---|
|@plait/core|框架核心：1.插件机制设计 2.提供数据模型、数据变换函数 3.提供基础的 board 组件，包含放大、缩小、滚动方案实现||
|@plait/text|画板中接入文本数据显示和编辑，依赖 Slate 及 slate-angular||
|@plait/mind|思维导图插件实现，基于独立的自动布局算法，目前支持：逻辑布局、标准布局、缩进布局||
|@plait/layouts|思维导图支持库，包含自动布局算法||
|@plait/flow|状态流转插件，可以用于实现可视化的状态流转配置、工作流转配置等功能||




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

const demoData = [
  {
    type: 'mindmap',
    id: '2',
    rightNodeCount: 3,
    data: { topic: { children: [{ text: '思维导图' }] } },
    children: [],
    width: 72,
    height: 25,
    isRoot: true,
    points: [[560, 700]],
  },
] as PlaitElement[];
```

更详细的示例说明参考：  [https://github.com/pubuzhixing8/plait-basic](https://github.com/pubuzhixing8/plait-basic)  



### 依赖

roughjs



### 贡献

当前 plait/core 框架还有 plait/mind 等插件都在高速的迭代中，大家有任何意见或者想法欢迎给我们反馈，也欢迎社区内对画图工具感性趣的同学给我们 PR。



### 开源协议

  [MIT License](https://github.com/worktile/slate-angular/blob/master/LICENSE)  



