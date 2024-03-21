---
'@plait/core': minor
---

add debug util methods to help developer to generate temporary drawing elements

### Debug 工具使用说明

#### 定义 

定义 debugKey 并且创建 debug generator


```
const debugKey = 'debug:plait:resize-for-rotation';
const debugGenerator = createDebugGenerator(debugKey);
```

> 如果想绘制真正的辅助线，需要在 localStorage 中添加键值对（'debugKey',true），例如：debug:plait:resize-for-rotation = true;

#### 清理 

在下一个渲染周期开始时清理生成的临时图形

```
debugGenerator.isDebug() && debugGenerator.clear();
```

#### 绘制辅助元素

真正绘制辅助元素的方法，目前支持：`drawPolygon`、`drawRectangle`、`drawCircles` 三种类型的元素绘制

绘制函数主要做的事情：

1. 生成元素 g
2. 添加到 g 到 activeHost
3. 添加到待清理列表，使调用 clear 时可以清楚上次绘制的元素 g
4. 返回新生成的 g 元素，方便开发做其它处理


```
debugGenerator.isDebug() && debugGenerator.drawRectangle(board, newBoundingBox, { stroke: 'blue' });
```

---


add debug util methods to help developer drawing temporary geometry elements

#### Define

Define debugKey and create debug generator


```
const debugKey = 'debug:plait:resize-for-rotation';
const debugGenerator = createDebugGenerator(debugKey);
```

> If you want to draw real auxiliary lines, you need to add a key-value pair ('debugKey', true) in localStorage, for example: debug:plait:resize-for-rotation = true;

#### Clear

Clean up the resulting temporary graphics at the start of the next render cycle

```
debugGenerator.isDebug() && debugGenerator.clear();
```

#### Draw auxiliary elements

The actual method of drawing auxiliary elements, currently supports three types of element drawing: `drawPolygon`, `drawRectangle`, and `drawCircles`

The main things the drawing function does:

1. Generate element g
2. Add g to activeHost
3. Add it to the list to be cleaned so that the last drawn element g can be cleared when calling clear
4. Return the newly generated g element to facilitate development and other processing


```
debugGenerator.isDebug() && debugGenerator.drawRectangle(board, newBoundingBox, { stroke: 'blue' });
```