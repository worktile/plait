import { PlaitNode, clearNodeWeakMap, createTestingBoard, fakeNodeWeakMap } from '@plait/core';
import { PlaitMindBoard } from '../plugins/with-mind-extend';
import { getTestingChildren } from '../testing/data/basic';
import { MindElement } from '../interfaces/element';
import { addEmoji, removeEmoji, replaceEmoji } from './emoji';
import { EmojiData, EmojiItem } from '../interfaces';

describe('transforms emoji', () => {
    let board: PlaitMindBoard;
    beforeEach(() => {
        const children = getTestingChildren();
        board = createTestingBoard([], children) as PlaitMindBoard;
        fakeNodeWeakMap(board);
    });

    afterEach(() => {
        clearNodeWeakMap(board);
    });

    it('should add emoji success', () => {
        const first = PlaitNode.get<MindElement>(board, [0, 0]);

        expect(first.data.emojis).toEqual(undefined);

        const emojiItem: EmojiItem = { name: '😊' };
        addEmoji(board, first, emojiItem);
        const newFirst = PlaitNode.get<MindElement<EmojiData>>(board, [0, 0]);

        expect(newFirst.data.emojis.length).toEqual(1);
        expect(newFirst.data.emojis[0]).toEqual(emojiItem);
    });

    it('should replace emoji success', () => {
        const first = PlaitNode.get<MindElement>(board, [0, 0]);
        const emojiItem: EmojiItem = { name: '😊' };
        addEmoji(board, first, emojiItem);
        // need to clear and re-fake weak map because element ref was modified
        clearNodeWeakMap(board);
        fakeNodeWeakMap(board);
        const addFirst = PlaitNode.get<MindElement<EmojiData>>(board, [0, 0]);
        const replaceItem: EmojiItem = { name: '😭' };
        replaceEmoji(board, addFirst, emojiItem, replaceItem);
        const replaceFirst = PlaitNode.get<MindElement<EmojiData>>(board, [0, 0]);

        expect(replaceFirst.data.emojis.length).toEqual(1);
        expect(replaceFirst.data.emojis[0]).toEqual(replaceItem);
    });

    it('should remove emoji success', () => {
        const first = PlaitNode.get<MindElement>(board, [0, 0]);
        const emojiItem: EmojiItem = { name: '😊' };
        addEmoji(board, first, emojiItem);
        // need to clear and re-fake weak map because element ref was modified
        clearNodeWeakMap(board);
        fakeNodeWeakMap(board);
        const addFirst = PlaitNode.get<MindElement<EmojiData>>(board, [0, 0]);
        removeEmoji(board, addFirst, emojiItem);
        const removeFirst = PlaitNode.get<MindElement>(board, [0, 0]);

        expect(removeFirst.data.emojis).toEqual(undefined);
    });
});
