---
'@plait/draw': patch
---

数据点之间存在 key points 的scene一定是成对出现，所以基于 start 点和 end 点计算两边的 middle key points (统一为 hasMidKeyPoints)，由 hasMidKeyPoints 去判定是否需要纠正 start 点和 end 点。
避免 start 或者 end 点单边出现 middleKeyPoints 不为空的情况。

Scenes with key points between data points must appear in pairs, so the middle key points on both sides are calculated based on the start point and the end point (unified as hasMidKeyPoints), and hasMidKeyPoints is used to determine whether the start point and end point need to be corrected.
Avoid the situation where middleKeyPoints is not empty on one side of the start or end point.
