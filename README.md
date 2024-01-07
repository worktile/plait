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
    A modern drawing framework for building all-in-one whiteboard tools </br>
    such as mind maps, flow charts, hand writing, etc.
  </h3>
</div>


Plait is positioned as a drawing framework that provides a plugin mechanism, allowing developers to extend functionality through plugins. It only provides a basic drawing whiteboard at the bottom, which only includes basic functions such as zooming in, zooming out, and moving the canvas. It does not include any business functions. All business functions need to be expanded through plugins to achieve free combination and can be easily implemented independently. Or an all-in-one drawing tool.


[中文文档](https://github.com/worktile/slate-angular/blob/master/README.zh-CN.md)

Plait will also provide some basic functional plugins, which have been implemented so far:

- Mind plugin

- Draw plugin

- Flow plugin



Plait architecture is inspired by the rich text editor framework Slate and is used for web-side interactive drawing business development.

![online demo screen](https://github.com/worktile/plait/blob/develop/.docgeni/public/assets/mind-draw-flow.gif?raw=true)


- 👉 [Online example (Draw)](https://plait-gamma.vercel.app?init=draw)
- 👉 [Online example (Mind)](https://plait-gamma.vercel.app?init=mind)
- 👉 [Online example (Flow)](https://plait-gamma.vercel.app/flow)
- 👉 [Documentation](https://plait-docs.vercel.app)

#### Features

- Provide basic drawing board capabilities
- Plugin mechanism
- Data model (supports collaboration)
- Component-based development (currently only supports Angular framework)
- Basic drawing tool functions



#### Packages

|Package Name|Description
|---|---|
|@plait/core|Core of the framework: 1. Plugin mechanism 2. Provide data model and transform functions 3. Provide basic board components|
|@plait/common|Some logic reused by different drawing plugins: 1. Basic tool functions 2. Basic plugins 3. Basic rendering logic|
|@plait/text|Text support, dependent on packages slate and slate-angular|
|@plait/mind|Mind plugin implementation, based on an independent automatic layout algorithm, currently supports: logical layout, standard layout, indented layout|
|@plait/draw|Flowchart plugin implementation, including interactive creation and modification of basic graphics, standard flowchart graphics, connections, free pictures and other elements|
|@plait/flow|Flow plugin, which can be used for visual configuration of process status|
|@plait/layouts|Mind support library, including automatic layout algorithms|


#### Who is using

- 🔥🔥🔥 [PingCode Wiki](https://pingcode.com/solutions/knowledge-manage)


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
    (plaitBoardInitialized)="plaitBoardInitialized($event)" (plaitChange)="change($event)">
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

  change(event: PlaitBoardChangeEvent) {
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


