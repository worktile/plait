---
title: 🕸️ @plait/mind
order: 4
---


@plait/mind 库包含思维导图的核心逻辑的实现，基于 Plait 框架，是最早也是目前唯一一个落地的业务插件。



**基础功能**

1. 支持逻辑布局、标准布局、缩进布局
1. 节点快捷新建（Tab、Enter）、删除（Delete、Backspace）
1. 节点主题文本编辑
1. 节点展开收起
1. 节点复制、粘贴




**高阶功能**

1. 节点支持拖拽调整位置
1. 节点支持概要/调整概要范围
1. 节点支持扩展设置 Emoji 表情
1. 交互式创建思维导图插件




**功能演示**





@plait/mind 核心仅仅包含数据渲染及核心交互实现，不包含工具栏、属性设置等基于界面的交互实现，因为这部分功能依赖于特定的界面风格（插件层不希望引入组件库），我们在设计上倾向于把这部分功能交由使用方自定义实现，插件层只提供事件支持及个性化配置支持。



**自定义扩展**



1. 支持 MindOptions 配置

提供 Mind 插件特有的可重写函数，用于使用方自定义 Mind 插件配置（控制渲染样式、交互风格等）：

```
export interface MindOptions {
    emojiPadding: number;
    spaceBetweenEmojis: number;
}
```

目前仅支持 emoji 扩展相关的自定义配置，后续会把节点之间的间隙、文本与节点之间的间隙等等做成自定义配置，目前这些配置是按照我们自己的需求固定在代码中的。



2. 支持扩展 Emoji

Mind 插件支持 Emoji 功能的时候仅仅提供了一个调用入口，需要使用方提供具体的一个 Emoji 渲染组件，用于具体的实现 Emoji 的渲染及交互，插件层不关注 Emoji 的交互细节、也不管理 Emoji 资源，仅仅控制 emoji 的渲染位置及空间占位。

提供可重写函数签名：

```
drawEmoji: (emoji: EmojiItem, element: MindElement) => ComponentType<MindEmojiBaseComponent>;
```

提供 Emoji 渲染组件基类：

```
@Directive({
    host: {
        class: 'mind-node-emoji'
    }
})
export class MindEmojiBaseComponent implements OnInit {
    @Input()
    fontSize: number = 14;

    @Input()
    emojiItem!: EmojiItem;

    @Input()
    board!: PlaitBoard;

    @Input()
    element!: MindElement<EmojiData>;

    get nativeElement() {
        return this.elementRef.nativeElement;
    }

    constructor(protected elementRef: ElementRef<HTMLElement>) {}

    ngOnInit(): void {
        this.elementRef.nativeElement.style.fontSize = `${this.fontSize}px`;
    }
}
```

不同提供默认实现

```
newBoard.drawEmoji = (emoji: EmojiItem, element: MindElement) => {
  throw new Error('Not implement drawEmoji method error.');
};
```



3. 概要调整

因为业务方需要在概要拖拽调整范围时做一定的业务处理，所以插件层增加了一个可重写方法用于抛出概要调整时的状态

提供可选的可重写函数签名 onAbstractResize： 

```
export interface PlaitAbstractBoard extends PlaitBoard {
    onAbstractResize?: (state: AbstractResizeState) => void;
}
```

AbstractResizeState 状态定义：

```
export enum AbstractResizeState {
    start = 'start',
    resizing = 'resizing',
    end = 'end'
}
```



**依赖**

@plait/core

@plait/layouts

@plait/richtext



