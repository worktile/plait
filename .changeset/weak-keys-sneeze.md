---
'@plait/common': patch
---

Remove touchstart event listener(prevented the default action to cause browser can not open keyboard in touch device)

Prevent the default action in multiple plugins(with-moving, with-resize, with-selection) to support resizing/selection/moving on touch device

Adding basic methods to viewport, such as isInVisibleViewport, scrollToVisibleWhenKeyboardOpening, support editing element scroll to visible when keyboard opening on touch device
