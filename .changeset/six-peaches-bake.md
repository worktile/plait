---
'@plait/common': minor
---

- Manage textManages based on Ref, remove textManages related logic from CommonElementFlavour

- Added TODO: Is it possible to position TextManager completely based on position to unify line and multi-text geometry?

When an element has multiple texts, TextManage cannot be obtained simply through position, so the corresponding relationship between keyword key and TextManage is saved here through Map alone.

1. The key of a single text element is the id of the element
2. The key of the table element is the id of the cell
3. For elements that conform to isMultipleTextGeometry, the key is the element id + text.id (usually not the id but the constant of the text position)
4. arrow-line and vector-line text do not depend on text.generator, TextManage can be found directly based on text

- 基于 Ref 管理 textManages，将 textManages 相关逻辑从 CommonElementFlavour 移除

- 增加 TODO: 是否可以完全基于位置定位 TextManager，实现 line 和 多文本 geometry 统一

一个元素有多个文本时，单纯通过位置无法获取 TextManage，因此这里单独通过 Map 保存关键字 key 和 TextManage 的对应关系

1. 单文本元素 key 就是元素的 id
2. 表格元素 key 是单元格的 id
3. 符合 isMultipleTextGeometry 的元素，key 是元素 id + text.id （通常不是 id 而是文本位置的常量）
4. arrow-line 和 vector-line 文本不依赖于 text.generator，基于 text 可以直接找到 TextManage
