import { ComponentRef, ViewContainerRef } from '@angular/core';
import { EmojiData, EmojiItem, MindElement } from '../interfaces';
import { MindEmojiBaseComponent } from '../base/emoji-base.component';
import { createForeignObject, createG } from '@plait/core';
import { getEmojiFontSize } from '../utils/space/emoji';
import { getEmojiForeignRectangle } from '../utils/position/emoji';
import { PlaitMindBoard } from '../plugins/with-mind.board';

class EmojiGenerator {
    componentRef: ComponentRef<MindEmojiBaseComponent> | null = null;

    constructor(private board: PlaitMindBoard, private viewContainerRef: ViewContainerRef) {}

    draw(emoji: EmojiItem, element: MindElement<EmojiData>) {
        this.destroy();
        const componentType = this.board.drawEmoji(emoji, element);
        this.componentRef = this.viewContainerRef.createComponent(componentType);
        this.componentRef.instance.emojiItem = emoji;
        this.componentRef.instance.board = this.board;
        this.componentRef.instance.element = element;
        this.componentRef.instance.fontSize = getEmojiFontSize(element);
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

export class NodeEmojisGenerator {
    emojiGenerators: EmojiGenerator[] = [];

    g?: SVGGElement;

    constructor(private board: PlaitMindBoard, private viewContainerRef: ViewContainerRef) {}

    drawEmojis(element: MindElement) {
        this.destroy();
        if (MindElement.hasEmojis(element)) {
            this.g = createG();
            this.g.classList.add('emojis');
            const foreignRectangle = getEmojiForeignRectangle(this.board, element);
            const foreignObject = createForeignObject(
                foreignRectangle.x,
                foreignRectangle.y,
                foreignRectangle.width,
                foreignRectangle.height
            );
            this.g.append(foreignObject);
            const container = document.createElement('div');
            container.classList.add('node-emojis-container');
            foreignObject.append(container);
            this.emojiGenerators = element.data.emojis.map(emojiItem => {
                const drawer = new EmojiGenerator(this.board, this.viewContainerRef);
                drawer.draw(emojiItem, element);
                return drawer;
            });
            this.emojiGenerators.forEach(drawer => {
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
        this.emojiGenerators.forEach(drawer => drawer.destroy());
        this.emojiGenerators = [];
    }
}
