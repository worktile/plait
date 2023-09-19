import {
    BACKSPACE,
    DELETE,
    ENTER,
    Path,
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

    it('should expand node when create node through press tab', () => {
        let target = PlaitNode.get<MindElement>(board, targetPath);
        target.isCollapsed = true;
        const event = createKeyboardEvent('keydown', TAB, 'Tab', {});
        board.keydown(event);
        target = PlaitNode.get<MindElement>(board, targetPath);
        expect(target.children.length).toEqual(2);
        expect(target.isCollapsed).toEqual(false);
    });

    it('press enter to create sibling node', () => {
        const parentPath = Path.parent(targetPath);
        let parent = PlaitNode.get<MindElement>(board, parentPath);
        const childrenCount = parent.children.length;
        const event = createKeyboardEvent('keydown', ENTER, 'Enter', {});
        board.keydown(event);
        parent = PlaitNode.get<MindElement>(board, parentPath);
        expect(parent.children.length).toEqual(childrenCount + 1);
    });

    describe('should not create sibling node when press enter', () => {
        it('selected multiple elements', () => {
            const secondTargetPath = [0, 1];
            const secondTarget = PlaitNode.get<MindElement>(board, secondTargetPath);
            addSelectedElement(board, secondTarget);
            const parentPath = Path.parent(targetPath);
            let parent = PlaitNode.get<MindElement>(board, parentPath);
            const childrenCount = parent.children.length;
            const event = createKeyboardEvent('keydown', ENTER, 'Enter', {});
            board.keydown(event);
            parent = PlaitNode.get<MindElement>(board, parentPath);
            expect(parent.children.length).toEqual(childrenCount);
        });
        it('selected element is root node', () => {
            clearSelectedElement(board);
            const childrenCount = board.children.length;
            const parentPath = Path.parent(targetPath);
            let parent = PlaitNode.get<MindElement>(board, parentPath);
            addSelectedElement(board, parent);
            const event = createKeyboardEvent('keydown', ENTER, 'Enter', {});
            board.keydown(event);
            parent = PlaitNode.get<MindElement>(board, parentPath);
            expect(board.children.length).toEqual(childrenCount);
        });
        it('selected element is abstract node', () => {
            clearSelectedElement(board);
            const targetPath = [0, 3];
            const parentPath = Path.parent(targetPath);
            let parent = PlaitNode.get<MindElement>(board, parentPath);
            const childrenCount = parent.children.length;
            const event = createKeyboardEvent('keydown', ENTER, 'Enter', {});
            board.keydown(event);
            parent = PlaitNode.get<MindElement>(board, parentPath);
            expect(parent.children.length).toEqual(childrenCount);
        });
    });

    describe('should delete selected elements when press backspace or delete', () => {
        it('press backspace', () => {
            const parentPath = Path.parent(targetPath);
            let parent = PlaitNode.get<MindElement>(board, parentPath);
            const childrenCount = parent.children.length;
            board.deleteFragment(null);
            parent = PlaitNode.get<MindElement>(board, parentPath);
            expect(parent.children.length).toEqual(childrenCount - 1);

            const abstractPath = [0, 2];
            const abstract = PlaitNode.get<MindElement>(board, abstractPath);
            expect(abstract.start).toEqual(0);
            expect(abstract.end).toEqual(0);
        });
    
        it('press delete', () => {
            const parentPath = Path.parent(targetPath);
            let parent = PlaitNode.get<MindElement>(board, parentPath);
            const childrenCount = parent.children.length;
            board.deleteFragment(null);
            parent = PlaitNode.get<MindElement>(board, parentPath);
            expect(parent.children.length).toEqual(childrenCount - 1);
        });

        it('should delete abstract when all of the nodes which abstract includes were deleted', () => {
            const secondTargetPath = [0, 1];
            const secondTarget = PlaitNode.get(board, secondTargetPath);
            addSelectedElement(board, secondTarget);

            const parentPath = Path.parent(targetPath);
            let parent = PlaitNode.get<MindElement>(board, parentPath);
            const childrenCount = parent.children.length;
            board.deleteFragment(null);
            parent = PlaitNode.get<MindElement>(board, parentPath);
            expect(parent.children.length).toEqual(childrenCount - 3);
        })
    });
});
