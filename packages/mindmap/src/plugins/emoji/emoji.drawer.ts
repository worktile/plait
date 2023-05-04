import { ComponentRef, ViewContainerRef } from '@angular/core';
import { EmojiItem, MindElement, PlaitMind } from '../../interfaces';
import { MindEmojiBaseComponent } from './emoji-base.component';
import { PlaitMindEmojiBoard } from './with-mind-emoji';
import { createForeignObject } from '@plait/richtext';
import { createG } from '@plait/core';
import { getRectangleByNode } from '../../utils/graph';
import { getEmojiFontSize, getEmojisRectangle } from './emoji';
import { NodeSpace } from '../../utils/node-space';

export class EmojiDrawer {
    componentRef: ComponentRef<MindEmojiBaseComponent> | null = null;

    constructor(private board: PlaitMindEmojiBoard, private viewContainerRef: ViewContainerRef) {}

    draw(emoji: EmojiItem, element: MindElement) {
        this.destroy();
        const componentType = this.board.drawEmoji(emoji, element);
        this.componentRef = this.viewContainerRef.createComponent(componentType);
        this.componentRef.instance.emojiItem = emoji;
        const fontSize = PlaitMind.isMind(element) ? 18 : 14;
        this.componentRef.instance.fontSize = fontSize;
    }

    get nativeElement() {
        if (this.componentRef) {
            return this.componentRef.instance.nativeElement;
        } else {
            return null;
        }
    }

    destroy() {
        if (this.componentRef) {
            this.componentRef.destroy();
            this.componentRef = null;
        }
    }
}

export class EmojisDrawer {
    emojiDrawers: EmojiDrawer[] = [];

    g?: SVGGElement;

    constructor(private board: PlaitMindEmojiBoard, private viewContainerRef: ViewContainerRef) {}

    drawEmojis(element: MindElement) {
        this.destroy();
        if (MindElement.hasEmojis(element)) {
            const node = MindElement.getNode(this.board, element);
            this.g = createG();
            this.g.classList.add('emojis');
            let { x, y } = getRectangleByNode(MindElement.getNode(this.board, element));
            x = x + NodeSpace.getEmojiHorizontalSpace(element);
            y = y + NodeSpace.getEmojiVerticalSpace(element);
            const { width, height } = getEmojisRectangle(element);
            const fontSize = getEmojiFontSize(element);
            const foreignObject = createForeignObject(x, y, width, height);
            this.g.append(foreignObject);
            const container = document.createElement('div');
            container.classList.add('node-emojis-container');
            container.classList.add(`emoji-font-size-${fontSize}`);
            foreignObject.append(container);
            this.emojiDrawers = element.data.emojis.map(emojiItem => {
                const drawer = new EmojiDrawer(this.board, this.viewContainerRef);
                drawer.draw(emojiItem, element);
                return drawer;
            });
            this.emojiDrawers.forEach(drawer => {
                container.append(drawer.nativeElement!);
            });
            return this.g;
        }
        return undefined;
    }

    destroy() {
        if (this.g) {
            this.g.remove();
        }
        this.emojiDrawers.forEach(drawer => drawer.destroy());
        this.emojiDrawers = [];
    }
}
