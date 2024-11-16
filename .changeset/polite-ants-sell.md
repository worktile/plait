---
'@plait/mind': minor
---

support strokeStyle for mind node and link

BREAK CHANGES: 

1. It is planned to replace branchColor and branchWidth with strokeColor and strokeWidth. To maintain compatibility, branchColor and branchWidth will not be deleted. BranchColor and branchWidth will be applied first.
2. Both branchWidth and branchColor attributes are applied to the child node first and no longer rely on the attributes of the parent node. BranchShape remains dependent on the attributes of the parent node.


破坏性更改：

1. 计划用 strokeColor 和 strokeWidth 替换 branchColor 和 branchWidth，为保持兼容 branchColor 和 branchWidth 不删除，优先应用 branchColor 和 branchWidth。
2. branchWidth 和 branchColor 属性都优先应用 child 节点，不再依赖父节点的属性，branchShape 保持依赖父节点属性
