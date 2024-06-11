import { EmojiData, EmojiItem, MindElement } from '../interfaces';
import { PlaitBoard, createForeignObject, createG } from '@plait/core';
import { getEmojiFontSize } from '../utils/space/emoji';
import { getEmojiForeignRectangle } from '../utils/position/emoji';
import { PlaitMindBoard } from '../plugins/with-mind.board';
import { EmojiComponentRef, EmojiProps, PlaitMindEmojiBoard } from '../emoji/with-emoji';

class EmojiGenerator {
    emojiComponentRef: EmojiComponentRef | null = null;

    constructor(private board: PlaitMindEmojiBoard & PlaitBoard) {}

    draw(container: Element | DocumentFragment, emoji: EmojiItem, element: MindElement<EmojiData>) {
        this.destroy();
        const props: EmojiProps = {
            board: this.board,
            emojiItem: emoji,
            element,
            fontSize: getEmojiFontSize(element)
        };
        this.emojiComponentRef = this.board.renderEmoji(container, props);
    }

    destroy() {
        if (this.emojiComponentRef) {
            this.emojiComponentRef.destroy();
            this.emojiComponentRef = null;
        }
    }
}

export class NodeEmojisGenerator {
    static key = 'node-emojis-generator';

    emojiGenerators: EmojiGenerator[] = [];

    g?: SVGGElement;

    constructor(private board: PlaitMindBoard) {}

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
                const drawer = new EmojiGenerator((this.board as unknown) as PlaitBoard & PlaitMindEmojiBoard);
                drawer.draw(container, emojiItem, element);
                return drawer;
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
