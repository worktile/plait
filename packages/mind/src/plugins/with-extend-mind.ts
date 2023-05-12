import { ComponentType, PlaitBoard } from '@plait/core';
import { MindElement } from '../interfaces/element';
import { EmojiItem } from '../interfaces/element-data';
import { MindEmojiBaseComponent } from './emoji';
import { MindOptions } from '../interfaces/options';

export interface PlaitMindBoard extends PlaitBoard {
    drawEmoji: (emoji: EmojiItem, element: MindElement) => ComponentType<MindEmojiBaseComponent>;
    getMindOptions: () => MindOptions;
}

export const withExtendMind = (board: PlaitBoard) => {
    const newBoard = board as PlaitBoard & PlaitMindBoard;

    newBoard.drawEmoji = (emoji: EmojiItem, element: MindElement) => {
        throw new Error('Not implement drawEmoji method error.');
    };

    newBoard.getMindOptions = () => {
        return { spaceBetweenEmojis: 4, emojiPadding: 0 };
    };

    return newBoard;
};
