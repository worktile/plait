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
    A modern drawing framework for building an all-in-one whiteboard tool </br>
    for interactive drawing features such as mind maps, flowcharts, and freehand drawing.
  </h3>
</div>


Plait is a modern drawing framework that provides a plugin mechanism, allowing developers to extend drawing functionalities through plugins. It is particularly suitable for the development of interactive whiteboard tools.


Plait does not rely on any frontend UI framework at its core, but it provides solutions for integrating with mainstream frontend UI frameworks to ensure a good development experience for upper-layer developers and to reuse mainstream framework components.


[中文文档](https://github.com/worktile/plait/blob/develop/README.zh-CN.md)

Plait will also provide some basic functional plugins, which have been implemented so far:

- Mind plugin

- Draw plugin

- Knowledge graph plugin

- Flow plugin


![online demo screen](https://github.com/worktile/plait/blob/develop/.docgeni/public/assets/mind-draw-flow.gif?raw=true)


- 👉 [Online example (Draw)](https://plait-gamma.vercel.app?init=draw)
- 👉 [Online example (Mind)](https://plait-gamma.vercel.app?init=mind)
- 👉 [Online example (GraphViz)](https://plait-gamma.vercel.app?init=mind)
- 👉 [Online example (Flow)](https://plait-gamma.vercel.app/flow)
- 👉 [Documentation](https://plait-docs.vercel.app)

#### Features

- Independent of UI frameworks
- Provides basic board capabilities, such as zooming in, zooming out, and moving
- Plugin mechanism
- Data model (supports collaboration)
- Basic drawing utility functions


#### UI Framework Integration

The implementation of the framework requires components from frontend UI frameworks as carriers. This ensures that the development of drawing functionalities follows mainstream development patterns (data-driven). Currently, integration with Angular and React frameworks is supported.

Text rendering in the plait is based on the Slate framework, enabling rich text rendering and editing on the board. Slate is an excellent rich text editor framework, and Plait was inspired by the Slate framework in its design


#### Packages

|Package Name|Description
|---|---|
|@plait/core| Framework core: plugin mechanism design, providing data models, data transformation functions, zooming, scrolling, etc |
|@plait/common|Common functionalities for interactive drawing, text rendering, and editing|
|@plait/text-plugins| General text extension functionalities, UI framework-independent, relies on the Slate rich text editor framework |
|@plait/mind| Mind map plugin, based on an independent automatic layout algorithm, supports: logical layout, standard layout, indent layout |
|@plait/draw| Flowchart plugin, supports: basic shapes, flowchart shapes, connections, free images, etc |
|@plait/flow| Process orchestration plugin, supports: standard nodes, connections, custom nodes, and connections |
|@plait/layouts| Mind map layout algorithms |
|@plait/angular-text| Text rendering component, relies on the Angular framework, Slate rich text editor framework, Angular view layer |
|@plait/angular-board| Whiteboard view layer component, relies on the Angular framework |
|@plait/react-text| Text rendering component, relies on the React framework, Slate rich text editor framework, React view layer |
|@plait/react-board| Whiteboard view layer component, relies on the React framework |


React view layer, text rendering component：[https://github.com/plait-board/drawnix](https://github.com/plait-board/drawnix)

#### Who is using

- 🔥🔥🔥 [PingCode Wiki](https://pingcode.com/solutions/knowledge-manage)
- 🔥 [Drawnix](https://github.com/plait-board/drawnix)

### Development

```
npm i

npm run build

npm run start
```


### Usage

Basic usage (integrated @plait/mind plugin)

HTML：

```
<plait-board [plaitPlugins]="plugins" [plaitValue]="value"
    (plaitBoardInitialized)="plaitBoardInitialized($event)" (onChange)="change($event)">
</plait-board>
```

TS：

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

For more detailed examples refer to：  [https://github.com/pubuzhixing8/plait-basic](https://github.com/pubuzhixing8/plait-basic)  



### Thanks

- [slate](https://github.com/ianstormtaylor/slate)

- [slate-angular](https://github.com/worktile/slate-angular)

- [rough](https://github.com/rough-stuff/rough)



### Contributing

Everyone is welcome to contribute to Plait and build a new generation of drawing framework together. Any Issue or PR is acceptable, and we hope to get your ⭐️ support.



### LICENSE

  [MIT License](https://github.com/worktile/slate-angular/blob/master/LICENSE)  


