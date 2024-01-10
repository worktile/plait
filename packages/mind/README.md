## @plait/mind
Implementation of the core logic of the mind map plugin.



**Basic functions**

1. Layout: logical layout, standard layout, indented layout
1. Node quick creation (Tab, Enter), deletion (Delete, Backspace)
1. Node theme text editing
1. Expand and collapse nodes
1. Copy and paste nodes
1. Insert pictures
1. Insert Emoji
1. Node Abstract
1. Color theme
1. Width adjustment
1. Multiple main topics


> @plait/mind The core only includes data rendering and core interaction implementation, and does not include interface-based interaction implementations such as toolbars and attribute settings. Because these functions depend on specific interface styles (the plug-in layer does not want to introduce UI libraries), we The design tends to leave this part of the function to the user for custom implementation, and the plugin layer only provides event support and special configuration support.



#### Dependence
- `@plait/core`
- `@plait/common`
- `@plait/text`
- `@plait/layouts`
