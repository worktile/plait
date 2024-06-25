import { EmojiData, EmojiItem } from '../interfaces/element-data';
import { PlaitBoard } from '@plait/core';
import { MindElement } from '../interfaces';

export abstract class MindEmojiBaseComponent {
    fontSize: number = 14;

    emojiItem!: EmojiItem;

    board!: PlaitBoard;

    element!: MindElement<EmojiData>;

    abstract nativeElement(): HTMLElement;
}
