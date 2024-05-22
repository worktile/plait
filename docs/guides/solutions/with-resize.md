---
title: with-resize
order: 5
---

思维导图节点内图片，图形，连线都有调整大小功能，并且流程基本相似，所以抽取通用插件 with-resize 处理通用功能，其他部分根据配置信息进行处理。

```
export interface WithResizeOptions> {
    key: string;
  	//是否能resize
    canResize: () => boolean;	
  	//检测是否触发 resize handle
    detect: (point: Point) => ResizeDetectResult<T, K> | null;  
  	//resize 时修改元素相关属性
    onResize: (resizeRef: ResizeRef<T, K>, resizeState: ResizeState) => void;
    afterResize?: (resizeRef: ResizeRef<T, K>) => void;
    beforeResize?: (resizeRef: ResizeRef<T, K>) => void;
}
```

在 @Plait/common 抽取通用 with-resize 插件
- pointerDown：调用 options.detect
- pointerMove: 先调用 options.beforeResize 开启 resize，后续的移动会调用 options.onResize() 持续修改数据
- pointerUp：调用 options.afterResize 

使用时配置 options 并将其传入 withResize。