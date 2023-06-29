import { PlaitBoard } from '@plait/core';
import { MindElement } from '../interfaces/element';
import { EmojiItem } from '../interfaces/element-data';
import { PlaitMindBoard } from './with-mind.board';
import { MindOptions } from '../interfaces/options';

export const withMindExtend = (board: PlaitBoard) => {
    const newBoard = board as PlaitBoard & PlaitMindBoard;

    newBoard.drawEmoji = (emoji: EmojiItem, element: MindElement) => {
        throw new Error('Not implement drawEmoji method error.');
    };

    newBoard.getMindOptions = (): MindOptions => {
        return { spaceBetweenEmojis: 4, emojiPadding: 0 };
    };

    return newBoard;
};
