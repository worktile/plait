---
'@plait/flow': minor
---

handle edge's g hierarchy logic

edge 层级需求：

1. 默认情况下 edge 的 label 部件层级应该高于其它 edge 连线
2. 默认情况下 node 部件层级应该高于 edge 连线
3. edge 元素处于 active（选中）/ highlight（选中关联节点）/ hovering 时给 edge 元素置于最高层，可以盖住其它 edge 的 label 和 其它任何 node 节点

处理思路：

1. 默认情况下将 edge 的「连线部件」放到 lowerHost 中，保证默认情况下 edge label 和 node 节点部件的层级高于 edge 的连线
2. 其它情况（active/highlight/hovering）将 edge 的「连线部件」放到当前 edge 元素的 elementG 中，并且提升 elementG 整体层级（放到 upperHost 中，默认放到 host 中）

edge level requirements:

1. By default, the edge label component level should be higher than other edge connections.
2. By default, the node component level should be higher than the edge connection
3. When the edge element is active (selected)/highlight (selected associated node)/hovering, place the edge element at the top level, which can cover other edge labels and any other node nodes.

Processing ideas:

1. By default, the edge's "connection component" is placed in lowerHost to ensure that the edge label and node node components are higher than the edge's connection by default.
2. In other cases (active/highlight/hovering), place the edge's "connection component" in elementG of the current edge element, and raise the overall level of elementG (put it in upperHost, by default it will be placed in host)
