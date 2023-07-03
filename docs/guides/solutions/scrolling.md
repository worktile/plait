---
title: 画布滚动
order: 1
---

主流的画板的滚动有两种交互，暂且把他们命名为：无限画布和有限画布

**无限画布：**

Excalidraw 、BlockSuite 算是无限画布，言外之意时画布是没有区域限制的，可以无限滚动到任何区域，也就是因为无限滚动的原因，整个画布是没法显示确切的滚动条，用户也就无法明确的知道那个区域有绘图元素。

**有限画布：**

语雀、XMind、ProcessOn 等产品是采用有限画布的形态，有限画布有一个优点就是可以显示滚动条 - 能直观的展示看出内容区域的大小，并且滚动区域会跟随绘图元素及其位置而动态更新。

我们最终选择了「有限画布」的交互形态。



### 画布大小

画布的大小及坐标体系遵循一个基础逻辑：

1. 保证所有绘图元素可见
1. 上下左右要留出一定的内边距（一般容器宽高的 1/2）




画布的显示区域是根据元素的位置及大小决定的，也就是要通过设置 SVG 的 viewBox 控制元素显示的坐标系保证元素内容可见，然后通过设置 SVG 元素宽度和容器宽高差来形成滚动条，这个滚动条是浏览器的默认真实滚动条。

> viewBox 属性的值是一个包含 4 个参数的列表   `min-x`  ,   `min-y`  ,   `width`   and   `height`  ，以空格或者逗号分隔开，在用户空间中指定一个矩形区域映射到给定的元素    [https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/viewBox](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/viewBox)  

当画布无缩放的情况下 SVG 的元素宽高和 SVG 的 viewBox 的宽高是一致的，SVG 的 viewBox 的值有元素内容的位置及大小决定，基础的计算规则如下：

**min-x**

所有元素内容的最小 x 坐标 - 容器宽度/2

**min-y**

所有元素内容的最小 y 坐标 - 容器高度/2

**width**

所有元素内容的最大 x 坐标 - 所有元素内容的最小 x 坐标 + 容器宽度

**height**

所有元素内容的最大 y 坐标 - 所有元素内容的最小 y 坐标 + 容器高度

通过这个计算规则可以轻松得出：无论绘图元素有元素多少、位置如何、大小如何他们都能显示在 viewBox 设定的坐标系内，并且元素的绘图元素上下左右边界距离视口都有一个固定的滚动距离。



### 缩放支持

画布的缩放是通过改变 SVG 元素的宽高实现，就是保持 viewBox 映射区域计算逻辑不变，让真实 SVG DOM 的宽高放大指定比例实现绘图元素的缩放。

**逻辑关系如下：**

1. SVG 元素宽度  = viewBox 宽度 * zoom
1. SVG 元素宽度  = viewBox 高度 * zoom




**viewBox 计算逻辑：**

前面已经对 viewBox 映射区域的计算规则进行了描述，但那是基础的逻辑，没有考虑缩放情况，实际计算中为了保证缩放前后绘图元素上下左右边界距离视口的滚动距离是固定，需要容器宽高以及初始坐标也进行等比缩放，最终的计算规则变成：

**min-x**

所有元素内容的最小 x 坐标 - 容器宽度 / 2 / zoom 

**min-y**

所有元素内容的最小 y 坐标 - 容器高度 / 2 / zoom

**width**

所有元素内容的最大 x 坐标 - 所有元素内容的最小 x 坐标 + 容器宽度 / zoom

**height**

所有元素内容的最大 y 坐标 - 所有元素内容的最小 y 坐标 + 容器高度 / zoom



**viewBox 计算逻辑简化版本：**

  [https://github.com/worktile/plait/blob/e3fba5d98ba69b1b520932f5ab72188a9b66776d/packages/plait/src/utils/viewport.ts#L68](https://github.com/worktile/plait/blob/e3fba5d98ba69b1b520932f5ab72188a9b66776d/packages/plait/src/utils/viewport.ts#L68)  

```
export function getViewBox(board: PlaitBoard, zoom: number) {
    const viewportContainerRect = PlaitBoard.getBoardNativeElement(board).getBoundingClientRect();
    const elementHostBBox = getElementHostBBox(board, zoom);

    const horizontalPadding = viewportContainerRect.width / 2;
    const verticalPadding = viewportContainerRect.height / 2;
    const viewBox = [
        elementHostBBox.left - horizontalPadding / zoom,
        elementHostBBox.top - verticalPadding / zoom,
        elementHostBBox.right - elementHostBBox.left + (horizontalPadding * 2) / zoom,
        elementHostBBox.bottom - elementHostBBox.top + (verticalPadding * 2) / zoom
    ];
    return viewBox;
}
```

**SVG 元素属性设置：**

  [https://github.com/worktile/plait/blob/7fe9cdf29b3fd9ce8e1c3a7b6757db0572602bb6/packages/plait/src/utils/viewport.ts#L86](https://github.com/worktile/plait/blob/7fe9cdf29b3fd9ce8e1c3a7b6757db0572602bb6/packages/plait/src/utils/viewport.ts#L86)  

```
export function setSVGViewBox(board: PlaitBoard, viewBox: number[]) {
    const zoom = board.viewport.zoom;
    const hostElement = PlaitBoard.getHost(board);
    hostElement.style.display = 'block';
    hostElement.style.width = `${viewBox[2] * zoom}px`;
    hostElement.style.height = `${viewBox[3] * zoom}px`;

    if (viewBox && viewBox[2] > 0 && viewBox[3] > 0) {
        hostElement.setAttribute('viewBox', viewBox.join(' '));
    }
}
```



### 视口位置

视口位置代表一种状态，用视口位置记录用户在视口内的滚动偏移量及缩放比，当用户刷新浏览器后可以基于存储的视口位置恢复画布的状态，对应的类型是 ViewPort：

```
export interface Viewport {
    zoom: number;
    origination?: Point;
}
```

其中 orignation 不是特别容易理解，需要绕一下，首先它代表的表层业务意义就是滚动偏移量，当画布滚动后它的值会变，但是它实际的值又不是滚动距离，  **origination 数据的实际意义是画板容器左上角的位置点在 SVG 设定的坐标系内的点位，这里将其定义为视口坐标**  ，相同 zoom、相同 origination、相同绘图元素的情况下容器元素距离左上角的距离是固定，由此实现对视口位置的定位控制。

下图是 origination 与画板容器、viewBox 映射坐标系的位置关系：

![Screen Shot 2023-06-09 at 17.31.06.png](https://atlas-rc.pingcode.com/files/public/6482f164e468e3b3652faea7/origin-url)

可以理解为 Element A 和 origination 是在同一坐标体系内（viewBox 映射的坐标系），他们的相对位置是固定的，然后 origination 永远指向视口（画板容器）的左上角，这样就很容易得出  Element A 在视口内的位置是可预期的。

还有一点需要明确：  **将视口坐标 origination 的值定位到视口的左上角需要通过设定画板的滚动距离实现**  ，也就是将画板滚动到指定位置，它们之间的转换逻辑下面介绍。



### 视口偏移与滚动距离

视口偏移和滚动距离其实对应的是两个坐标系，视口偏移对应的是 viewBox 映射坐标系，而滚动距离对应的是浏览器的像素坐标系，而缩放比为 1 的情况下视口偏移与滚动距离其实是 1:1 的关系。

视口偏移距离计算逻辑实例如下图所示：

![Screen Shot 2023-06-09 at 18.08.28.png](https://atlas-rc.pingcode.com/files/public/6482fa24e468e3b3652faebe/origin-url)

offsetX：origination.x - viewBoxStart.x

offsetY：origination.y - viewBoxStart.y

当时缩放比不为 1 时视口偏移距离乘以缩放比后和滚动距离才是 1:1 的对应关系。

最终，视口偏移到滚动距离的转换关系如下：

scrollLeft：(origination.x - viewBoxStart.x) * zoom

scrollLeft：(origination.y - viewBoxStart.y) * zoom

**代码位置：**

  [https://github.com/worktile/plait/blob/4f2ef7918d774ad2a60dfe2bf525e66ea7e945fc/packages/plait/src/utils/viewport.ts#L98](https://github.com/worktile/plait/blob/4f2ef7918d774ad2a60dfe2bf525e66ea7e945fc/packages/plait/src/utils/viewport.ts#L98)  

```
export function updateViewportOffset(board: PlaitBoard) {
    const origination = getViewportOrigination(board);
    if (!origination) return;

    const { zoom } = board.viewport;
    const viewBox = getViewBox(board, zoom);
    const scrollLeft = (origination![0] - viewBox[0]) * zoom;
    const scrollTop = (origination![1] - viewBox[1]) * zoom;
    updateViewportContainerScroll(board, scrollLeft, scrollTop);
}
```



### 视口偏移重新计算

影响视口偏移的情况有三种：

1. 画板滚动
1. 画板缩放


以上两种情况发生，视口的 origination 需要重新计算，他们的逻辑也不复杂，下面一一解释。



**画板滚动**

这个前面介绍「视口偏移与滚动距离」时已经介绍，他们之间的转换逻辑也已经详细说明，只不过前面介绍的是：视口偏移 -> 滚动距离，而这里要说明的其实是它的反过程，就是用户滚动画板后调整对应的视口偏移也就是 origination，因为转换逻辑的思路是同一个，所以这里不多做介绍。



**画板缩放**

画板缩放时的处理稍微复杂一点，而它也是这个滚动方案的唯一难点。

画板缩放后 SVG 元素的宽高会发生变化，这代表着浏览器坐标系和 viewBox 坐标系的对应关系被打乱，因此视口偏移和滚动距离的映射需要重新计算，并且画板缩放会改变视口偏移量（origination），计算逻辑需要选定一个中心点，基于中心点的位置重新推算新的 origination，它的计算逻辑如下：

```
// 选定的中心点，以当前窗口中心作为中心点
let focusPoint = [boardContainerRect.width / 2, boardContainerRect.height / 2];
// 当前缩放比
const zoom = board.viewport.zoom;
// 当前 orination
const origination = getViewportOrigination(board);
// 当前中心点
const centerX = origination![0] + focusPoint[0] / zoom;
const centerY = origination![1] + focusPoint[1] / zoom;
// 新的 origination
const newOrigination = [centerX - focusPoint[0] / newZoom, centerY - focusPoint[1] / newZoom] as Point;
```

> 新 origiantion 计算的原则是确保缩放前后选中中心点的位置相对视口不发生偏移，这个点位原本如果是在中心，那么缩放该改点位还是在中心。

某些场景下缩放的中心点不是浏览器窗口的中心点，有可能是选定鼠标所在位置作为中心点，这时只需要把 focusPoint 调整为鼠标点所在的位置即可（鼠标点位对应到画板容器的像素坐标系的位置）。



画板缩放绘图元素数据变化

绘图元素数据变化虽然不会影响视口偏移，但是因为元素变化会导致 viewBox 坐标系发生变化，原本从视口偏移映射的滚动距离将不再准确，所以当绘图元素数据变化后需要重新映射滚动距离，这个逻辑被封装在 with-viewport 中。



### 处理流程

**① 初始化流程：**

![Screen Shot 2023-06-30 at 10.07.18.png](https://atlas-rc.pingcode.com/files/public/649e38fe4469f81eed579b6c/origin-url)

**② 视口变化处理流程：**

![Screen Shot 2023-06-30 at 10.07.34.png](https://atlas-rc.pingcode.com/files/public/649e38f34469f81eed579b6b/origin-url)

**③ 滚动处理流程：**

当用户操作滚动视图窗口时其实就是涉及 viewport 视口的偏移量发生变化，所以在浏览器滚动发生后就需要根据最新的滚动距离反向重新推算视口偏移量，然后更新视口偏移量（调用 updateViewport ）

![Screen Shot 2023-06-30 at 10.17.12.png](https://atlas-rc.pingcode.com/files/public/649e3b304469f81eed579b70/origin-url)

**打破循环：**

1. 在「  **③ 滚动处理流程**  」中会监控滚动事件，然后计算新的 origiantion 进而调用 updateViewport 方法，updateViewport 其实就是更改 board 的 viewport 属性，这个操作会触发 onChange 事件，也就是会进入「  **② 视口变化处理流程**  」。
1. 「  **② 视口变化处理流程**  」最终会根据最新的 viewport 数据推算浏览器的滚动偏移量，然后更新 viewport 容器的滚动距离，这个操作其实会额外触发滚动事件，因此会进入「  **② 视口变化处理流程**  」


可以看出这个两个流程是存在循环调用风险的，稍有一点点的计算偏差都会造成死循环，所以在代码上进行了中断处理：

1. 「  **③ 滚动处理流程**  」中调用 updateViewport 会增加一个  `IS_FROM_SCROLLING`  标识，在执行「  **② 视口变化处理流程**  」时发现如果更新来源于  `IS_FROM_SCROLLING`  则不再更新 viewport 滚动的滚动距离操作。
1. 「  **③ 滚动处理流程**  」中调用会判断基于最新计算的滚动偏移量 newOrigination 和 当前的 origiantion 是否相同，如果相同则不再调用 updateViewport ，打破中断（理论上这里也是增加一个标识更稳妥）。






### 坐标转换

**鼠标点位 -> 基于 SVG 元素的像素坐标**

这个转换的由来是基于 DOM 的 mousedown、mousemove、mouseup 等事件源中获取到的坐标（event.x, event.y）是基于浏览器视口的，而 Plait 的画板在某些场景下并不是占满整个屏幕，随意需要获取鼠标点基于画板视口的坐标，逻辑不复杂：

```
// container 为画板 SVG 元素
// x,y 为鼠标事件源坐标
export function toPoint(x: number, y: number, container: SVGElement): Point {
    const rect = container.getBoundingClientRect();
    return [x - rect.x, y - rect.y];
}
```



**基于 SVG 元素的像素坐标 -> viewBox 坐标系**

通过 toPoint 方法获取到的是基于 SVG 元素的像素坐标，这个像素坐标和画板 SVG 通过 viewBox 映射的坐标系的坐标有一定的对应关系，它受 viewBox 映射坐标系其实位置及画板缩放比的影响，转换逻辑也不复杂：

```
export function transformPoint(board: PlaitBoard, point: Point) {
    const { width, height } = PlaitBoard.getHost(board).getBoundingClientRect();
    const viewBox = PlaitBoard.getHost(board).viewBox.baseVal;
    const x = (point[0] / width) * viewBox.width + viewBox.x;
    const y = (point[1] / height) * viewBox.height + viewBox.y;
    const newPoint = [x, y] as Point;
    return newPoint;
}
```

以 x 值例，计算思路是拿原始像素坐标 x 除 SVG 元素的 DOM 宽度得到一个比例（基于像素坐标系），拿这个比例乘上映射坐标系的总宽度得到的是在映射坐标系下（viewBox 坐标系）鼠标点的偏移值，最后加上映射坐标系的起始点坐标得到鼠标点在映射坐标系下的坐标。



**映射坐标（视口偏移）转滚动距离**

这个和在【视口偏移与滚动距离】介绍的一致。



**滚动距离转映射坐标（计算新的视口偏移量）**

就是【视口偏移重新计算】-> 【画板滚动】中的逻辑，是映射坐标转滚动距离的一个反向过程，主要逻辑如下：

```
const zoom = this.board.viewport.zoom;
const viewBox = getViewBox(this.board, zoom);
const origination = [scrollLeft / zoom + viewBox[0], scrollTop / zoom + viewBox[1]] as Point;
```

> 基于最新的滚动距离除缩放比加起始坐标，这个过程和【  **基于 SVG 元素的像素坐标 -> viewBox 坐标系**  】同是基于像素坐标转映射坐标，可以用相同的逻辑，目前这两种计算方式是等价的。



