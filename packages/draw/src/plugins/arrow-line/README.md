# 箭头线

## AutoComplete

意为自动完成，根据图形四周的四个 Handle 点实现快捷创建基于图形的连线、快捷创建连接图形。

- `getAutoCompletePoints` 基于图形元素获取四周的 Handle 点的位置
- `ArrowLineAutoCompleteGenerator` 用于绘制元素周围的四个 Handle 点，在其中使用了 `getAutoCompletePoints`
- `withArrowLineAutoComplete` 插件完成点击 Handle 点拖出一条正交线的交互行为，提供了可配置参数 `afterComplete`，用于连线创建完成后后续行为的处理，比如弹出图形选择面板设置箭头终点关联的图形
- `withArrowLineAutoCompleteReaction` 插件完成鼠标 Hover 到 Handle 点的高亮反馈
- `withArrowLineBoundReaction` 插件完成拖动或者创建箭头时移动到关联元素时的高亮反馈及吸附处理
- 箭头和图形的绑定关系的建立分布在三个插件中：
    1. `withArrowLineCreateByDraw` 插件在箭头元素创建时建立绑定关系
    2. `withArrowLineAutoComplete` 快捷创建连线插件也会在完成元素创建时直接建立绑定关系
    3. `withArrowLineResize` 已经存在的箭头通过拖拽端点建立绑定关系或者修改绑定关系