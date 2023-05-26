import { ComponentType } from '@plait/core';
import { MindElement } from '../interfaces/element';
import { EmojiItem } from '../interfaces/element-data';
import { MindOptions } from '../interfaces/options';
import { PlaitAbstractBoard } from './with-abstract-resize.board';
import { MindEmojiBaseComponent } from '../base/emoji-base.component';

export interface PlaitMindBoard extends PlaitAbstractBoard {
    drawEmoji: (emoji: EmojiItem, element: MindElement) => ComponentType<MindEmojiBaseComponent>;
    getMindOptions: () => MindOptions;
}
