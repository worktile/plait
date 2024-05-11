---
title: engine
order: 5
---

作用：抽取不同形状对应不同情况下的统一逻辑

```
export interface GeometryEngine {
    draw;	//绘制逻辑
    isHit; //是否击中
    getNearestPoint; // 获取最近距离
    getConnectorPoints; // 获取关联示意点
    getCornerPoints; // 获取拐角点
    getEdgeByConnectionPoint?; // 根据关联点获取边
    getTangentVectorByConnectionPoint? ; // 根据关联点获取切线
}
```

