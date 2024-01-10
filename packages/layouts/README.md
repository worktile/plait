# @plait/layouts

It is used to implement the mind map automatic layout algorithm. Based on an independent algorithm, the mind map node layout logic can be decoupled from other functions. The automatic layout algorithm only focuses on the location distribution of nodes.


**Layout Classification**

1. Logical layout
1. Standard layout
1. Indent layout
1. Layout nesting


> Timeline and fishbone are not supported yet



**Algorithm Implementation**

The layout algorithm in this library mainly refers to the implementation ideas in the paper [Drawing Non-layered Tidy Trees in Linear Time], and has been appropriately transformed. The abstraction of nodes also follows the abstract implementation in the paper.

### Reference

For the paper, see: [https://github.com/Klortho/d3-flextree/tree/master/papers]()


open source library: [https://github.com/leungwensen/mindmap-layouts](https://github.com/leungwensen/mindmap-layouts)