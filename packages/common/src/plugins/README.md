# 可复用的插件逻辑
用于实现画图插件的一些通用交互逻辑处理，逻辑处理相同的部分写在 `@plait/common` 中，不同插件逻辑不通的部分通过插件 Options 实现自定义。

## with-resize

不同的插件都会有 Resize 调整宽高的需求（思维导图节点宽度、思维导图节点图片、流程图节点宽高），它们的处理模式是相似的：

1. 他们可能有一些触发 Resize 的必要条件，比如：处于节点选中
2. 可能在鼠标 hover 到可拖拽区域时鼠标 Cursor 需要有反应
3. 交互过程：指针按下发起拖拽、指针移动触发拖拽、指针抬起完成拖拽

都是 Resize 的需求，但是他们也有很多不同的逻辑需要处理，比如不同业务下可拖拽区域逻辑可能不同、数据修改不同，目前 with-resize 的自定义 Options 如下：

```
export interface WithResizeOptions<T extends PlaitElement = PlaitElement> {
    key: string;
    canResize: () => boolean;
    detect: (point: Point) => ResizeDetectResult<T> | null;
    onResize: (resizeRef: ResizeRef<T>, resizeState: ResizeState) => void;
}
```

`key` 给每一个 Resize 插件定义的一个标识，这个标识在 Resizing 中会作为样式 class 名称被动态添加到 board 组件容器容器上;

`canResize` 自定义的拖拽触发条件;

`detect` 可拖拽区域探测逻辑，鼠标 hover 过程中或者用户点击都会调用探测函数，进行可拖拽探测;

`onResize` 拖拽过程中的回调，用于最终处理数据的修改，并且对于数据的校验、最大值、最小值的限制都可以在这里完成;