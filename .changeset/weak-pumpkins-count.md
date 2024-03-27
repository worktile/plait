---
'@plait/core': minor
---

Guaranteed that the `getDeletedFragment` overridable function is called before the `deleteFragment` overridable function

Remove the `getDeletedFragment` call from the default implementation of `deleteFragment` and call it externally, while encapsulating the tool function `deleteFragment`:

```
export const deleteFragment = (board: PlaitBoard) => {
     const elements = board.getDeletedFragment([]);
     board.deleteFragment(elements);
}
```

Where board.deleteFragment(null) was used before, the tool function `deleteFragment()` is now uniformly called.

保证 `getDeletedFragment` 可重写函数调用先于 `deleteFragment` 可重写函数

将 `getDeletedFragment` 调用从 `deleteFragment` 默认实现中移除，改为在外部调用，同时封装工具函数 `deleteFragment`：

```
export const deleteFragment = (board: PlaitBoard) => {
    const elements = board.getDeletedFragment([]);
    board.deleteFragment(elements);
}
```

以前使用 board.deleteFragment(null) 的地方现在统一改为调用工具函数 `deleteFragment()`