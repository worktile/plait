import {
    PlaitBoard,
    PlaitNode,
    SLASH,
    TAB,
    addSelectedElement,
    clearNodeWeakMap,
    clearSelectedElement,
    createKeyboardEvent,
    createModModifierKeys,
    createTestingBoard,
    fakeNodeWeakMap
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
        clearSelectedElement(board);
        clearNodeWeakMap(board);
    });

    it('collapse/expand node', () => {
        let target = PlaitNode.get<MindElement>(board, targetPath);
        expect(target.isCollapsed).toEqual(undefined);
        const event = createKeyboardEvent('keydown', SLASH, '/', createModModifierKeys());
        board.keydown(event);
        target = PlaitNode.get<MindElement>(board, targetPath);
        expect(target.isCollapsed).toEqual(true);

        clearSelectedElement(board);
        addSelectedElement(board, target);

        clearNodeWeakMap(board);
        fakeNodeWeakMap(board);

        board.keydown(event);
        target = PlaitNode.get<MindElement>(board, targetPath);
        expect(target.isCollapsed).toEqual(false);
    });

    it('tab create node', () => {
        let target = PlaitNode.get<MindElement>(board, targetPath);
        expect(target.isCollapsed).toEqual(undefined);
        const event = createKeyboardEvent('keydown', TAB, 'Tab', {});
        board.keydown(event);
        target = PlaitNode.get<MindElement>(board, targetPath);
        expect(target.children.length).toEqual(2);
    });

    it('do nothing when selected multiple elements', () => {
        let target = PlaitNode.get<MindElement>(board, targetPath);
        const secondTargetPath = [0, 1];
        const secondTarget = PlaitNode.get<MindElement>(board, secondTargetPath);
        addSelectedElement(board, secondTarget);
        const event = createKeyboardEvent('keydown', TAB, 'Tab', {});
        board.keydown(event);
        expect(target.children.length).toEqual(1);
    });

    it('expand node when tab create node', () => {
        let target = PlaitNode.get<MindElement>(board, targetPath);
        target.isCollapsed = true;
        const event = createKeyboardEvent('keydown', TAB, 'Tab', {});
        board.keydown(event);
        target = PlaitNode.get<MindElement>(board, targetPath);
        expect(target.children.length).toEqual(2);
        expect(target.isCollapsed).toEqual(false);
    });
});
