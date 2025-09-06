---
'@plait/common': patch
'@plait/core': patch
---

Remove rxjs independency from plait/common、plait/core

Redraw group's boundary in onChange, which was handled by onStable mechanism (use rxjs). Since it need be handle after all others elements be handled.
