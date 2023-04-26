import { ComponentRef, ViewContainerRef } from '@angular/core';
import { EmojiItem, MindElement, PlaitMind } from '../../interfaces';
import { MindEmojiComponent } from './emoji.component';
import { PlaitMindEmojiBoard } from './with-mind-emoji';
import { createForeignObject } from '@plait/richtext';
import { createG } from '@plait/core';

export class EmojiDrawer {
    emoji?: EmojiItem;
    element?: MindElement;
    componentRef?: ComponentRef<MindEmojiComponent>;

    constructor(private board: PlaitMindEmojiBoard, private viewContainerRef: ViewContainerRef) {}

    draw(emoji: EmojiItem, element: MindElement) {
        this.destroy();
        this.emoji = emoji;
        this.element = element;
        const componentType = this.board.drawEmoji(emoji, element);
        this.componentRef = this.viewContainerRef.createComponent(componentType);
        this.componentRef.instance.emojiItem = emoji;
        const fontSize = PlaitMind.isMind(element) ? 18 : 14;
        this.componentRef.instance.fontSize = fontSize;
    }

    get nativeElement() {
        return this.componentRef?.instance.nativeElement;
    }

    destroy() {
        if (this.componentRef) {
            this.componentRef.destroy();
        }
    }
}

export class EmojiListDrawer {
    emojiDrawers: EmojiDrawer[] = [];

    foreignObject?: SVGForeignObjectElement;

    g?: SVGGElement;

    constructor(private board: PlaitMindEmojiBoard, private viewContainerRef: ViewContainerRef) {}

    drawEmojiList(element: MindElement) {
        this.destroy();

        if (element.data.emojis) {
            const node = MindElement.getNode(this.board, element);
            this.g = createG();
            // 给出正确的坐标，给出正确的宽和高
            this.foreignObject = createForeignObject(node.x, node.y, 100, 30);
            this.emojiDrawers = element.data.emojis.map(emojiItem => {
                const drawer = new EmojiDrawer(this.board as PlaitMindEmojiBoard, this.viewContainerRef);
                drawer.draw(emojiItem, element);
                return drawer;
            });
            this.g.append(this.foreignObject);
            this.emojiDrawers.forEach((drawer) => {
                this.foreignObject?.append(drawer.nativeElement!)
            });
        }
    }

    destroy() {
        if (this.g) {
            this.g.remove();
        }
        this.emojiDrawers.forEach(drawer => drawer.destroy());
        this.emojiDrawers = [];
    }
}
