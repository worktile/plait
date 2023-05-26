import { BaseData, EmojiItem, MindElement, PlaitMindBoard } from '@plait/mind';
import { MindEmojiComponent } from './emoji.component';
import { PlaitBoard } from '@plait/core';

export const withEmojiExtend = (board: PlaitBoard) => {
    const newBoard = board as PlaitBoard & PlaitMindBoard;

    newBoard.drawEmoji = (emojiItem: EmojiItem, element: MindElement<BaseData>) => {
        return MindEmojiComponent;
    };

    return newBoard;
};
