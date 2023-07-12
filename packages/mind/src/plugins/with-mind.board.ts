import { ComponentType } from '@plait/core';
import { MindElement } from '../interfaces/element';
import { EmojiItem, ImageItem } from '../interfaces/element-data';
import { PlaitAbstractBoard } from './with-abstract-resize.board';
import { MindEmojiBaseComponent } from '../base/emoji-base.component';
import { MindImageBaseComponent } from '../base/image-base.component';

export interface PlaitMindBoard extends PlaitAbstractBoard {
    drawEmoji: (emoji: EmojiItem, element: MindElement) => ComponentType<MindEmojiBaseComponent>;
    drawImage: (image: ImageItem, element: MindElement) => ComponentType<MindImageBaseComponent>;
}
