---
'@plait/core': minor
'@plait/draw': minor
---

add afterChange method and move the timing of plaitChange event trigging to afterChange
overriding the afterChange method of board can handle some things between the component update and the component triggering the change event.
