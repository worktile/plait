---
title: 单元测试
order: 5
---


Plait 前期为了赶进度单元测试一直是缺失的，这就导致一个问题，当我们决定要给某一个功能或者函数添加单元测试时，会感到无从下手，一方面是陌生感不知道哪些该测那些不该测，一方面由于架构设计的原因函数会依赖一些有副作用的代码（WeakMap），这些副作用依赖组件运行后动态构建的上下文，还有一个原因就是单元测试也应该有一些规范，这也是导致无从下手的一个原因。因此，这两天专门花了一些时间考虑了下单元测试到底该怎么写，并封装了一些测试用的工具函数（主要用于模拟组件运行时的副作用上下文、构建 board 实例）。

在 plait/mind 中单元测试应该有一个分类：

|分类|依赖上下文|示例|
|---|---|---|
|纯函数|||
|依赖元素父子关系|代码中调用：1. PlaitBoard.findPath 2. MindElement.getParent 3. ...|mind/src/utils/abstract/common.spec.ts|
|依赖布局节点（MindNode）|代码中依赖 MindNode|mind/src/utils/position/topic.spec.ts|
|依赖数据变换/插件|代码中调用 Transforms.xxxx 对 board 数据进行修改|mind/src/transforms/emoji.spec.ts|
|组件实例|对组件进行测试，上下文则直接包含|暂无|


分类 1 - 纯函数：单元测试比较好写，无须模拟上下文依赖；

分类 2 - 依赖元素父子关系：需要模拟构建上下文依赖，这部分代码已经被封装在 plait/core 的 testing 目录中；

分类 3 - 依赖布局节点：需要在测试中调用布局算法，然后模拟构建 ELEMENT 和 LayoutNode （mindz中的 MindNode 类型）的对应关系，这部分代码被封装在了 plait/mind 的 testing 目录中；

分类 4 - 依赖数据变换/插件：这里需要构建一个 board 实例，构建数据修改及插件运行环境，并且需要支持传入自定义插件，这也属于框架逻辑，所以被封装在 plait/core 的 testing 目录中；

分类 5 - 组件实例：对于组件的测试目前还未封装，后续完善；



在实际写测试中分类 2 和分类 3 他们构建依赖上下文的测试可以合并在一起，创建 board 实例、构建元素父子关系：

```
let board: PlaitBoard;
beforeEach(() => {
    const children = getTestingChildren();
    board = createTestingBoard([], children);
    fakeNodeWeakMap(board);
});

afterEach(() => {
  	clearNodeWeakMap(board);
});
```

#### 验证插件是否向下游传递事件

当测试需要确认一个插件没有吞掉事件，而是把事件继续交给下游处理器时，可以使用 `createBoardEventObserver`：

```ts
import { createBoardEventObserver, createPointerEvent, setupTestingBoard } from '@plait/core';

const observer = createBoardEventObserver(['pointerDown']);
const fixture = setupTestingBoard([observer.plugin, pluginUnderTest], []);
const event = createPointerEvent('pointerdown');

fixture.board.pointerDown(event);

expect(observer.calls.pointerDown).toEqual([event]);

observer.clear();
fixture.destroy();
```

插件顺序需要保持为 `[observer.plugin, pluginUnderTest]`。插件从左到右应用，因此待测插件会包裹观察器；只有待测插件确实调用了下游处理器，事件才会出现在 `observer.calls` 中。

`createBoardEventObserver` 只负责记录指定事件并继续调用原处理器，不依赖 Jasmine、Vitest 或 Jest。`clear()` 只清空调用记录，Board 相关测试资源仍应通过 `fixture.destroy()` 清理。

另外分类 3 在写测试的时候需要注意，如果一个测试用例里面包含超过一次的数据修改，那么在每一次的数据修改后都需要重新调用 fakeNodeWeakmap 构建基于最新数据引用的父子关系依赖：

```
it('should replace emoji success', () => {
    const first = PlaitNode.get<MindElement>(board, [0, 0]);
    const emojiItem: EmojiItem = { name: '😊' };
    addEmoji(board, first, emojiItem);
    // need to clear and re-fake weak map because element ref was modified
    clearNodeWeakMap(board);
    fakeNodeWeakMap(board);
    const addFirst = PlaitNode.get<MindElement<EmojiData>>(board, [0, 0]);
    const replaceItem: EmojiItem = { name: '😭' };
    replaceEmoji(board, addFirst, emojiItem, replaceItem);
    const replaceFirst = PlaitNode.get<MindElement<EmojiData>>(board, [0, 0]);

    expect(replaceFirst.data.emojis.length).toEqual(1);
    expect(replaceFirst.data.emojis[0]).toEqual(replaceItem);
});
```



补充单元测试，也是一次很好的梳理代码结构的机会



不得不说写单元测试是一件非常难的事情，而把单元测试写的有条理则更难，因为它首先需要你的代码是有条理的（模块划分是否清楚、调用关系/目录关系是否统一、函数职责是否唯一/或者存在重复），如果代码结构、调用关系、职责划分等等不清晰，你的单元测试则会很混乱（无法按照一个统一的思路把所有的分支逻辑全部覆盖），或者出现重复功能的单元测试，必然会造成时间的浪费，也会消磨维护单元测试的信心。


