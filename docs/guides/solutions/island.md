---
title: Island
order: 2
---


以前在 @plait/core 中实现了一个 toolbar 组件，这个组件意义不大，外层通常还会自定义工具栏，现在把这个组件从 core 中移除，并且把工具栏中可能会用到的一些操作方法进行整理统一放到 BoardTransforms 中，并且在 core 中提供一个组件基类 PlaitIslandBaseComponent 用来约束类似于工具栏这类组件的基础行为。



#### 为什么抽取基类组件

首先 PlaitIslandBaseComponent 不提供具体的功能，主要意义是连接 board 和外部组件、同步 board 的更改到外部组件（自定义的工具栏或者属性设置面板）。

外部组件理论上是不受底层控制的，然后一个基本的需求是：当 board 数据更改或者内部的状态更改（比如指针）底层需要把这些更改同步给外层组件，以驱动这些组件的界面刷新，所以抽取了这个基类对这类组件组件进行统一的管控。



#### 如何使用

1. 外层组件在实现是需要继承 PlaitIslandBaseComponent
1. 需要将组件的签名指定到 PlaitIslandBaseComponent 上


```
@Component({
    selector: 'app-toolbar',
    templateUrl: './toolbar.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: PlaitIslandBaseComponent, useExisting: forwardRef(() => AppToolbarBaseComponent) }]
})
export class AppToolbarBaseComponent extends PlaitIslandBaseComponent {
    constructor(protected cdr: ChangeDetectorRef) {
        super(cdr);
    }
}
```

1. 在使用 <app-toolbar> 是需要将它放到 <plait-board> 组件内部


```
<plait-board>
    <app-toolbar></app-toolbar>
 </plait-board>
```



如此就可以将外部自定义的组件与 board 关联，当 board 数据变换或者 board 的指针类型发生变化外部组件均可收到通知进行变换检测。



**OnBoardChange**

当外部组件需要在数据变化时进行二次数据处理，则可以实现 OnBoardChange  ** **  接口，在 onBoardChange 中进行数据处理

```
export class AppToolbarBaseComponent extends PlaitIslandBaseComponent implements OnBoardChange {
    constructor(protected cdr: ChangeDetectorRef) {
        super(cdr);
    }

    onBoardChange() {
        // 
    }
}
```

每次数据更新或者指针变更底层都会自动调用组件的 onBoardChange 方法，方法执行完成后再进行变化检测刷新界面。



#### 实现思路

这里将这个基类抽象为 Island（意为：岛屿），避免与工具栏强绑定。

在 board 组件中通过 ContentChildren 获取所有嵌入到 board 组件内的所有 island 组件

```
@ContentChildren(PlaitIslandBaseComponent, { descendants: true }) islands?: QueryList<PlaitIslandBaseComponent>;
```

因为底层自动识别嵌入到组件中的所有集成自 PlaitIslandBaseComponent 的组件，所有需要显示的在组件定义的地方配置一个 provider 将 PlaitIslandBaseComponent 指定为当前组件。

> 这种方式还是有些隐晦，使用起来也有些繁琐，未来可以会采用其他方式将 island 传递给 board 组件



**目前支持两种操作类型**

1. 一种是 board 的数据更新（对应 onChange 函数）
1. 一种是指针的更新，对应 BoardTransforms.updatePointerType


底层分别在相应入口处调用 Island 组件的 markForCheck 以及 onBoardChange 函数。

> 目前 onBoardChange 没有任何的参数，无法直接确定是数据更新还是 pointerType 更新  但是数据更新的同步是在 onChange 的执行周期内进行的，所有可以访问 board.operations 进行操作类型的断言，如果是指针更新那么获取到的 operations 为空，暂时可以以此进行逻辑的处理。

