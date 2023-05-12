import { ComponentType, PlaitBoard } from '@plait/core';
import { MindElement } from '../../interfaces/element';
import { EmojiItem } from '../../interfaces/element-data';
import { MindEmojiBaseComponent } from './emoji-base.component';

export interface PlaitMindEmojiBoard extends PlaitBoard {
    drawEmoji: (emoji: EmojiItem, element: MindElement) => ComponentType<MindEmojiBaseComponent>;
}

export const withEmoji = (board: PlaitBoard) => {
    const newBoard = board as PlaitBoard & PlaitMindEmojiBoard;

    newBoard.drawEmoji = (emoji: EmojiItem, element: MindElement) => {
        throw new Error('Not implement drawEmoji method error.');
    };

    return newBoard;
};
