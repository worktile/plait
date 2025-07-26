### 屏幕坐标点

pointer 事件拿到的 x、y（event.x, event.t），基于浏览器的屏幕坐标系，浏览器可视区域的左上角的坐标值为 `[0,0]`


### Host 坐标点（hostPoint）

基于 svg 元素左上角 x、y 为起点，按照向右、向下延伸增加坐标构建的坐标系。

`toHostPoint` 用于将屏幕坐标点转化为 Active 坐标点。

`toScreenPointFromHostPoint` 是 `toHostPoint` 反向过程。


### ViewBox 坐标点（viewBoxPoint）

基于 svg 的 viewBox 构建的坐标系点，比如：属性 `viewBox="-808.5599365234375 -1134.345703125 1454.515625 2287.287109375"`，代表 svg 左上角的坐标 x 是 `-808.5599365234375`，y 是 `-1134.345703125`，svg 构建的位置坐标系中总宽度是 `1454.515625`，总高度是 `1454.515625 2287`。

关于白板缩放：viewBox 坐标系和 Host 坐标系的差异除了起始位置不同之外还有受缩放的影响，白板的缩放逻辑很简单，`scale` 为 `1` 时，viewBox 和 host 宽度和高度比都是 `1:1`，完全相同，`scale` 为 `2`（放大画布） 时 viewBox 和 host 的宽度和高度的比都是 `1:2`，`scale` 为 `0.5`（缩小画布） 时 viewBox 和 host 的宽度和高度的比都是 `2:1`，而 viewBox 的起始位置是根据中心缩放逻辑和缩放比计算出来的。

`toViewBoxPoint` 用于将 hostPoint 转换为 viewBoxPoint，画板元素数据中存储的 points 点位对应的值逻辑上是 viewBoxPoint。

`toHostPointFromViewBoxPoint` 是 `toViewBoxPoint` 的反向过程。

### Active 坐标点（activePoint）

这个是为了实现特殊需求而设定的概念，它本质上还是基于屏幕坐标系，只不过它的起始点在画板组件 DOM 元素的左上角，当画板嵌套的业务系统中是它的实际屏幕坐标不是 `[0,0]`。

---

English version

### Screen Coordinates

The x, y coordinates obtained from pointer events (event.x, event.y) are based on the browser's screen coordinate system, where the top-left corner of the browser's visible area has the coordinate value of `[0,0]`.

### Host Coordinates (hostPoint)

A coordinate system built from the top-left corner of the SVG element as the origin point (x, y), with coordinates increasing as they extend right and down.

`toHostPoint` is used to convert screen coordinates to Active coordinates.

`toScreenPointFromHostPoint` is the reverse process of `toHostPoint`.

### ViewBox Coordinates (viewBoxPoint)

A coordinate system built based on the SVG's viewBox attribute. For example: the attribute `viewBox="-808.5599365234375 -1134.345703125 1454.515625 2287.287109375"` means the SVG's top-left corner has coordinates x: `-808.5599365234375`, y: `-1134.345703125`, and the total width in the SVG's positioned coordinate system is `1454.515625`, with a total height of `2287.287109375`.

Regarding whiteboard scaling: The difference between the viewBox coordinate system and the Host coordinate system, besides the different starting positions, is also affected by scaling. The whiteboard scaling logic is simple: when `scale` is `1`, the width and height ratio between viewBox and host is `1:1`, completely identical. When `scale` is `2` (enlarging the canvas), the width and height ratio between viewBox and host is `1:2`. When `scale` is `0.5` (shrinking the canvas), the width and height ratio between viewBox and host is `2:1`. The starting position of viewBox is calculated based on the center scaling logic and the scaling ratio.

`toViewBoxPoint` is used to convert hostPoint to viewBoxPoint. The points values stored in the drawing board element data logically correspond to viewBoxPoint.

`toHostPointFromViewBoxPoint` is the reverse process of `toViewBoxPoint`.

### Active Coordinates (activePoint)

This concept is created to implement special requirements. It is essentially still based on the screen coordinate system, but its starting point is at the top-left corner of the drawing board component DOM element. When the drawing board is nested in a business system, its actual screen coordinates are not `[0,0]`.
