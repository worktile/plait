---
title: 主题方案
order: 4
---

# 整体设计与机制：

board 新增属性

```
export interface PlaitBoard {
  	...
	theme: PlaitTheme;//board 主题
}

export interface PlaitTheme {
    themeColorMode: ThemeColorMode;
}

```

新增主题类型：

```
export enum ThemeColorMode {
    'default' = 'default',
    'colorful' = 'colorful',
    'soft' = 'soft',
    'retro' = 'retro',
    'dark' = 'dark',
    'starry' = 'starry'
}
```

修改主题的两个方式：

- 通过参数
    - PlaitBoardComponent 接收 plaitTheme 参数，将参数赋值给 board
    - 组件根据主题给 svg 添加不同的类，显示不同的背景色
    - 节点根据自身属性和主题来展示默认颜色
- 主动调用设置主题函数


```
function updateThemeColor(board: PlaitBoard, mode: ThemeColorMode) {
    mode = mode ?? board.theme.themeColorMode;
    setTheme(board, { themeColorMode: mode }); //board 内部处理，添加 set_theme 的操作

    depthFirstRecursion((board as unknown) as PlaitElement, element => {
        board.applyTheme(element); //遍历处理节点，抹除与颜色相关的属性
    });
}
```



# 使用：

- 增加主题配置参数：


```
    options: PlaitBoardOptions = {
         themeColors?: ThemeColor[];
    };
```

- 被动传入：


通过传入的主题，和主题配置

```
   <plait-board
	[plaitTheme]="theme"
    [plaitOptions]="options"
	>
```

- 主动修改：  `BoardTransforms.updateThemeColor(board: PlaitBoard, mode: ThemeColorMode)`  
- 获取主题配置相关工具函数：  `PlaitBoard.getThemeColors<MindThemeColor>(board)`  










