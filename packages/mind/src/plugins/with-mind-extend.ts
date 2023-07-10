import { PlaitBoard, PlaitOptionsBoard } from '@plait/core';
import { MindElement } from '../interfaces/element';
import { EmojiItem } from '../interfaces/element-data';
import { PlaitMindBoard } from './with-mind.board';
import { WithMindOptions } from '../interfaces/options';
import { WithMindPluginKey } from '../constants/default';

export const withMindExtend = (board: PlaitBoard) => {
    const newBoard = board as PlaitBoard & PlaitMindBoard;

    newBoard.drawEmoji = (emoji: EmojiItem, element: MindElement) => {
        throw new Error('Not implement drawEmoji method error.');
    };

    (board as PlaitOptionsBoard).setPluginOptions<WithMindOptions>(WithMindPluginKey, { spaceBetweenEmojis: 4, emojiPadding: 0 });

    return newBoard;
};
