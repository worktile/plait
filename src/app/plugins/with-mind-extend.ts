import { PlaitMindBoard, WithMindOptions, WithMindPluginKey } from '@plait/mind';
import { PlaitBoard, PlaitOptionsBoard } from '@plait/core';
import { MindEmojiComponent } from '../editor/emoji/emoji.component';

export const withMindExtend = (board: PlaitBoard) => {
    const newBoard = board as PlaitBoard & PlaitMindBoard;

    (board as PlaitOptionsBoard).setPluginOptions<WithMindOptions>(WithMindPluginKey, {
        isMultiple: true,
        emojiPadding: 0,
        spaceBetweenEmojis: 4,
        emojiComponentType: MindEmojiComponent
    });

    return newBoard;
};
