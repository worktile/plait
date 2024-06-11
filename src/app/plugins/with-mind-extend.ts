import { EmojiProps, PlaitMindBoard, PlaitMindEmojiBoard, WithMindOptions, WithMindPluginKey } from '@plait/mind';
import { PlaitBoard, PlaitOptionsBoard } from '@plait/core';
import { AngularBoard } from '@plait/angular-board';
import { MindEmojiComponent } from '../editor/emoji/emoji.component';

export const withMindExtend = (board: PlaitBoard) => {
    const newBoard = board as PlaitBoard & PlaitMindBoard & PlaitMindEmojiBoard & AngularBoard;

    (board as PlaitOptionsBoard).setPluginOptions<WithMindOptions>(WithMindPluginKey, {
        isMultiple: true,
        emojiPadding: 0,
        spaceBetweenEmojis: 4
    });

    newBoard.renderEmoji = (container: Element | DocumentFragment, props: EmojiProps) => {
        const { ref } = newBoard.renderComponent(MindEmojiComponent, container, props);
        return ref;
    };

    return newBoard;
};
