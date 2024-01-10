## @plait/core

[中文](https://github.com/worktile/plait/blob/develop/packages/core/README.zh-CN.md)


The Plait framework core library includes core data model, data transformation functions, plugin mechanisms, etc. In addition, it also includes plugin element rendering base class and board components containing basic whiteboard interactions.



> Currently @plait/core takes on too many responsibilities, including the core data model, plugin mechanism, the bridging layer of the front-end framework layer, and some basic drawing-related plugins, because currently it only needs some basic drawing board requirements (such as frame selection, dragging and moving element positions) will all be in the core, and more detailed package divisions may be considered in the future.



####   **Basic whiteboard functions**

1. Provide a drawing board component (based on Angular)
1. Zoom in, zoom out, and drag the canvas
1. Integrated canvas scrolling solution
1. Undo, redo
1. Click/drag to select elements
1. Drag to adjust element position
1. Theme plan




#### **Design ideas**

Plait is a framework designed for all-in-one whiteboard tool, its core is plugin mechanism and data model. The plugin mechanism is the external manifestation, it allows developers to extend the functionality of the whiteboard in the form of plugins. The framework provides the necessary extension bridges and communication mechanisms to serve plugin development. The data model is the kernel, providing definitions for data and functions for data operation, and is the internal representation of the plugin.


**Plugin mechanism**

The plugin mechanism builds an extension bridge based on override methods. It currently supports custom interaction and custom rendering. In terms of custom interaction, plait/core currently directly defines basic DOM events as override methods in the most primitive way, such as: PointerDown, pointerUp, pointerMove, keyDown, keyUp, etc. do not have too many business-level encapsulations. Custom rendering currently supports extending the rendering of plugins in the form of Angular components.



**Data Model**

Mainly provides the following capabilities:

1. Provide basic data model
1. Provide atomic-based data change methods (Transforms)
1. Based on immutable data model (based on Immer)
1. Provide a Change mechanism to cooperate with the framework to complete data-driven rendering.
1. Integrated with the plugin mechanism, the data modification process can be intercepted and processed




**Standard data flow**

![data flow](https://github.com/worktile/plait/blob/develop/.docgeni/public/assets/packages/data-flow.png?raw=true)



#### **Architecture diagram**

![architecture diagram](https://github.com/worktile/plait/blob/develop/.docgeni/public/assets/packages/architecture-diagram.png?raw=true)


#### Dependence

- `roughjs`
- `is-hotkey`

