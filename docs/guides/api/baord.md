### 输入参数

#### plaitValue

必填，可以为空，传递组件支持的插件数据值



#### plaitViewport

非必填，用于设置视口的默认值缩放比和滚动偏移量，类型为 Viewport

|字段|是否必填|默认值|说明|
|---|---|---|---|
|zoom|是|1|定义画板的缩放比|
|origination|否|无|定义画板滚动偏移量|


#### plaitPlugins

非必填，可以为空，用于传递自定义插件数据



#### plaitOptions

组件的自定义参数配置选项，类型为 PlaitBoardOptions

|字段|是否必填|默认值|说明|
|---|---|---|---|
|readonly|否|false|是否可编辑|
|hideScrollbar|否|false|是否隐藏画板工具栏|
|disabledScrollOnNonFocus|否|false|当画板无焦点时是否禁用画板的滚动行为|




#### 输出参数

plaitChange



plaitBoardInitialized