import { ComponentType, PlaitBoard, PlaitPlugin } from '@plait/core';
import { MindElement } from '../../interfaces/element';
import { EmojiItem } from '../../interfaces/element-data';
import { MindEmojiComponent } from './emoji.component';

export interface PlaitMindEmojiBoard extends PlaitBoard {
    drawEmoji: (emoji: EmojiItem, element: MindElement) => ComponentType<MindEmojiComponent>;
}

export const withEmoji: PlaitPlugin = (board: PlaitBoard) => {
    const newBoard = board as PlaitBoard & PlaitMindEmojiBoard;

    newBoard.drawEmoji = (emoji: EmojiItem, element: MindElement) => {
        return MindEmojiComponent;
    }

    return newBoard;
};