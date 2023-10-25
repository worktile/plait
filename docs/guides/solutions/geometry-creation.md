---
title: geometry-creation
order: 4
---

**图形创建方式：**

1. 点击图标，点击画布，创建默认大小的图形
2. 按下并拖动图标，鼠标移至画布，松开，创建默认大小的图形
3. 点击图标，移动至画布内，点击并拖动，创建自定义大小的图形

**将上述创建方式归类，分为几种情况并创建数据结构**：

```
//图形类型
export enum DrawPointerType {
    text = 'text',
    rectangle = 'rectangle',
    line = 'line',
	...
}
//创建方式
export enum BoardCreationMode {
    'dnd' = 'dnd',
    'drawing' = 'drawing'
}
```

**创建流程：**

使用方：

- 图标 mousedown 执行 setCreationMode 设置 dnd 创建模式 （对应第二种创建模式）

- 监听 mouseup 执行 setCreationMode 设置 drawing 创建模式（对应第一种和第三种创建模式）	

底层插件：

- dnd 插件
  - pointermove：实时绘制图形
  - pointerup：根据坐标插入对应图形
- drawing 插件：
  - pointerdown：记录起始点
  - pointermove：根据起始点，实时绘制图形
  - pointerup：根据坐标插入对应图形;计算抬起鼠标时与起始点的距离，根据距离判断是否是第二种创建方式
