---
title: 快速开始
order: 2
---

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

效果图：

![Screen Shot 2023-05-08 at 17.23.05.png](https://atlas-rc.pingcode.com/files/public/6458bf9b5200ed5a459e25ff/origin-url)

更详细的示例说明参考：  [https://github.com/pubuzhixing8/plait-basic](https://github.com/pubuzhixing8/plait-basic)  