---
'@plait/common': minor
'@plait/mind': minor
---

fix topic text can not show completely in different machines 

1. add getElementSize to remeasure the width and height for text element and cache to `ELEMENT_TO_SIZE_MAP`.
2. apply getElementSize to get the width and height for mind node topic text.
3. handling the effect of mind node functions, such as editing topic, resizing mind node width and so on.
