import { ComponentType } from '@plait/core';
import { MindElement } from '../interfaces/element';
import { EmojiItem } from '../interfaces/element-data';
import { PlaitAbstractBoard } from './with-abstract-resize.board';
import { MindEmojiBaseComponent } from '../base/emoji-base.component';

export interface PlaitMindBoard extends PlaitAbstractBoard {
    drawEmoji: (emoji: EmojiItem, element: MindElement) => ComponentType<MindEmojiBaseComponent>;
}
