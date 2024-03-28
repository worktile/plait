---
'@plait/draw': minor
---

When batching `Resize`, if the element has a rotation angle, the axis of `Resize` will be re-determined based on the rotation angle.

`plait/core`: Extract the `isAxisChangedByAngle` method to determine whether the rotation angle will cause the `Resize` axis of the element to change.

批量`Resize`时，如果元素有旋转角度则根据旋转角度重新确定`Resize`的轴

`plait/core`: 提取`isAxisChangedByAngle`方法用于判断旋转角度是会造成元素的`Resize`轴线是否发生变化
