---
'@plait/angular-board': patch
'@plait/angular-text': patch
'@plait/common': patch
---

invoking updateForeignObject will trigger auto scroll (browser default behavior) which cause board unexceptional scrolling

so need remove updateForeignObject and invoke immediately onChange to avoid coming up shaking in drawnix

prevent board children being covered when board is in FLUSHING
