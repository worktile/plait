import {
    PlaitBoard,
    PlaitNode,
    SLASH,
    addSelectedElement,
    clearNodeWeakMap,
    createKeyboardEvent,
    createModModifierKeys,
    createTestingBoard,
    fakeNodeWeakMap,
    removeSelectedElement
} from '@plait/core';
import { getTestingChildren } from '../testing/data/basic';
import { withMindHotkey } from './with-mind-hotkey';
import { createMindElement } from '../utils';
import { MindElement } from '@plait/mind';

describe('with mind hotkey plugin', () => {
    let board: PlaitBoard;
    const targetPath = [0, 0];
    beforeEach(() => {
        const child1 = createMindElement('sub child', 40, 20, {});
        const children = getTestingChildren();
        board = createTestingBoard([withMindHotkey], children);
        fakeNodeWeakMap(board);

        const parent = PlaitNode.get(board, targetPath);
        parent.children?.push(child1);
        addSelectedElement(board, parent);
    });

    afterEach(() => {
        removeSelectedElement(board, PlaitNode.get(board, targetPath));
        clearNodeWeakMap(board);
    });

    it('collapse node', () => {
        let target = PlaitNode.get<MindElement>(board, targetPath);
        expect(target.isCollapsed).toEqual(undefined);
        const event = createKeyboardEvent('keydown', SLASH, '/', createModModifierKeys());
        board.keydown(event);
        target = PlaitNode.get<MindElement>(board, targetPath);
        expect(target.isCollapsed).toEqual(true);
    });

    it('expand node', () => {
        let target = PlaitNode.get<MindElement>(board, targetPath);
        expect(target.isCollapsed).toEqual(undefined);
        target.isCollapsed = true;
        const event = createKeyboardEvent('keydown', SLASH, '/', createModModifierKeys());
        board.keydown(event);
        target = PlaitNode.get<MindElement>(board, targetPath);
        expect(target.isCollapsed).toEqual(false);
    });
});

export const fakeKeyboardEvent = () => {};
