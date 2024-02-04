import { PlaitBoard, PlaitOptionsBoard } from '@plait/core';
import { PlaitMindBoard } from './with-mind.board';
import { WithMindOptions } from '../interfaces/options';
import { WithMindPluginKey } from '../constants/default';

export const withMindExtend = (board: PlaitBoard) => {
    const newBoard = board as PlaitBoard & PlaitMindBoard;

    (board as PlaitOptionsBoard).setPluginOptions<WithMindOptions>(WithMindPluginKey, { spaceBetweenEmojis: 4, emojiPadding: 0 });

    return newBoard;
};
