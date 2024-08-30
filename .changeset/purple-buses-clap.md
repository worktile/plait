---
'@plait/angular-board': minor
'@plait/core': minor
---

performance: 

1. use KEY_TO_ELEMENT_MAP cache the relation between element's key and element and use KEY_TO_ELEMENT_MAP in getElementById to optimize performance

2. add replaceSelectedElement to take the place of the new selected element
