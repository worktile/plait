---
title: generator
order: 4
---

### 功能介绍

统一绘制入口，并统一输出图形

```
//@plait/common
export abstract class Generator {
    g?: SVGGElement;

    constructor(protected board: PlaitBoard, options?: V) {}

  	//调用 draw 将图形添加到 g 里
    draw(element: T, parentG: SVGGElement, data?: K) {} 

  	//用于判断是否可以绘制
    abstract canDraw(element: T, data?: K): boolean;

  	//绘制逻辑
    abstract draw(element: T, data?: K): SVGGElement | undefined;

    destroy() {}
}
```

使用方：

```
export class GeometryShapeGenerator extends Generator {
		//实现 candraw
    canDraw(): boolean {}
		//实现 draw 返回绘制完成的图形
    draw() {}
}
```

组件内：

```
//实例化 generator
const generator = new GeometryShapeGenerator()
//调用绘制方法，generator 自动将绘制好的图形放到 g 中
generator.processDrawing(g)
```

