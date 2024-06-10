import { PlaitBoard } from '@plait/core';
import { RenderComponentRef } from '@plait/common';
import { EmojiData, EmojiItem } from '../interfaces/element-data';
import { MindElement } from '../interfaces/element';

export interface PlaitMindEmojiBoard {
    renderEmoji: (container: Element | DocumentFragment, props: EmojiProps) => EmojiComponentRef;
}

export const withEmoji = <T extends PlaitBoard = PlaitBoard>(board: T) => {
    const newBoard = board as T & PlaitMindEmojiBoard;

    newBoard.renderEmoji = (container: Element | DocumentFragment, props: EmojiProps) => {
        throw new Error('No implementation for renderEmoji method.');
    };
    return newBoard;
};

export type EmojiComponentRef = RenderComponentRef<EmojiProps>;

export interface EmojiProps {
    board: PlaitBoard;
    emojiItem: EmojiItem;
    element: MindElement<EmojiData>;
    fontSize: number;
}
