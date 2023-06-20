---
title: 插件配置支持自定义
order: 1
---


实现一个自定义插件有时候免不了要支持一些自定义配置。

比如 @plait/core 中的 with-selection 插件支持支持了点选/框选的功能，但是有些场景下业务方可能只需要点选，不希望有框选的功能（不允许多个节点同时选中），这时候插件就需要自定义的一些配置。

在 @plait/mind 中支持 emoji 表情时也遇到了类似的需求，在确定 emoji 组件渲染大小和位置时希望可以动态配置间距，以解决不同场景下间距不一致的问题。

为此，@plait/core 中支持了一个 with-options 的插件，用于为每一个插件动态配置自定义选项，它内部使用 Map 存储每个插件的自定义配置，所有如果插件需要自定义配置，则需要额外给插件定义个唯一 Key。



#### 如何使用

**1.插件默认配置（withSelection）：**

```
export interface WithPluginOptions extends PlaitPluginOptions {
    isMultiple: boolean;
}
export function withSelection(board: PlaitBoard) {
  	// ...
	(board as PlaitOptionsBoard).setPluginOptions<WithPluginOptions>(PlaitPluginKey.withSelection, { isMultiple: true });
}
```



**2.上层重写配置（withFlow）：**

```
export const withFlow: PlaitPlugin = (board: PlaitBoard) => {
    // ...
    (board as PlaitOptionsBoard).setPluginOptions<WithPluginOptions>(PlaitPluginKey.withSelection, { isMultiple: false });
};
```



#### 代码实现

该方案逻辑非常简单，就是在 board 对象上挂载了两个函数：

getPluginOptions - 获取插件配置

setPluginOptions - 重写插件配置

```
export const withOptions = (board: PlaitBoard) => {
    const pluginOptions = new Map<string, any>();
    const newBoard = board as PlaitOptionsBoard;

    newBoard.getPluginOptions = key => {
        return pluginOptions.get(key);
    };

    newBoard.setPluginOptions = (key, options) => {
        const oldOptions = newBoard.getPluginOptions(key) || {};
        pluginOptions.set(key, { ...oldOptions, ...options });
    };
    
    return newBoard;
};
```

定义基础定义：

```
export interface PlaitPluginOptions {
    disabled?: boolean;
}

export interface PlaitOptionsBoard extends PlaitBoard {
    getPluginOptions: <K = PlaitPluginOptions>(key: string) => K;
    setPluginOptions: <K = PlaitPluginOptions>(key: string, value: K) => void;
}
```

> 理论上 getPluginOptions 和 setPluginOptions 都是可重写方法，但是这只是理论，应该没有场景需要重写这两个方法的基础实现，实现一个插件的自定义设置只需要插件中或者全局调用 setPluginOptions 即可。  setPluginOptions 中实现了基础的属性合并



#### 方案说明

该方案非常简洁，又非常灵活。

这种方案也可以很容易实现特定时机下的属性的自定义，就是当程序执行进入特定周期后给它设置特定的 Option 然后当程序执行退出该周期时还原 Option 配置。

需要注意一点的的是，应该避免缓存配置，而应该随时使用随时获取（毕竟读取数据不会有任何性能问题），以便获取的自定配置是最新的。

