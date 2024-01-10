
# @plait/layouts

用于实现思维导图自动布局算法，基于独立的算法可以将思维导图节点布局逻辑与其他功能实现解耦，自动布局算法只关注节点的位置分布。

**布局分类**

1. 逻辑布局
1. 标准布局
1. 缩进布局
1. 布局嵌套


> 时间线和鱼骨图暂不支持



**算法实现**

本库中的布局算法主要参考了   [Drawing Non-layered Tidy Trees in Linear Time] 论文中  的实现思路，对它进行了适当的改造，节点的抽象也沿用了论文中的抽象实现。

### 参考

论文翻译见：  [https://zhuanlan.zhihu.com/p/573659320](https://zhuanlan.zhihu.com/p/573659320)  


开源库：[https://github.com/leungwensen/mindmap-layouts](https://github.com/leungwensen/mindmap-layouts)  

