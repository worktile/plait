import {
    DOWN_ARROW,
    ENTER,
    LEFT_ARROW,
    Path,
    PlaitBoard,
    PlaitNode,
    RIGHT_ARROW,
    SLASH,
    TAB,
    UP_ARROW,
    addSelectedElement,
    clearNodeWeakMap,
    clearSelectedElement,
    createKeyboardEvent,
    createModModifierKeys,
    createTestingBoard,
    fakeNodeWeakMap,
    getSelectedElements
} from '@plait/core';
import { getTestingChildren } from '../testing/data/basic';
import { withMindHotkey } from './with-mind-hotkey';
import { PlaitMindBoard } from './with-mind.board';
import { createMindElement } from '../utils';
import { MindElement, PlaitMind } from '@plait/mind';
import { fakeMindLayout, clearLayoutNodeWeakMap } from '../testing/core/fake-layout-node';
import { MindNode } from '../interfaces';

const createNavigationTestingChildren = (): MindElement[] => [
    {
        type: 'mind',
        id: 'A',
        rightNodeCount: 2,
        data: { topic: { children: [{ text: 'A' }] } },
        children: [
            {
                id: 'B',
                type: 'mind_child',
                data: { topic: { children: [{ text: 'B' }] } },
                children: [
                    {
                        id: 'C',
                        type: 'mind_child',
                        data: { topic: { children: [{ text: 'C' }] } },
                        children: [{ id: 'D', type: 'mind_child', data: { topic: { children: [{ text: 'D' }] } }, children: [] }]
                    }
                ]
            },
            {
                id: 'E',
                type: 'mind_child',
                data: { topic: { children: [{ text: 'E' }] } },
                children: [
                    {
                        id: 'F',
                        type: 'mind_child',
                        data: { topic: { children: [{ text: 'F' }] } },
                        children: [{ id: 'G', type: 'mind_child', data: { topic: { children: [{ text: 'G' }] } }, children: [] }]
                    }
                ]
            }
        ],
        points: [[0, 0]],
        isCollapsed: false
    }
];

describe('with mind hotkey plugin', () => {
    let board: PlaitBoard;
    let layoutRoot: MindNode | undefined;
    const targetPath = [0, 0];
    beforeEach(() => {
        const child1 = createMindElement('sub child', {});
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
        if (layoutRoot) {
            clearLayoutNodeWeakMap(layoutRoot);
            layoutRoot = undefined;
        }
    });

    it('collapse/expand node', () => {
        let target = PlaitNode.get<MindElement>(board, targetPath);
        expect(target.isCollapsed).toEqual(undefined);
        const event = createKeyboardEvent('keydown', SLASH, '/', createModModifierKeys());
        board.keyDown(event);
        target = PlaitNode.get<MindElement>(board, targetPath);
        expect(target.isCollapsed).toEqual(true);

        clearSelectedElement(board);
        addSelectedElement(board, target);

        clearNodeWeakMap(board);
        fakeNodeWeakMap(board);

        board.keyDown(event);
        target = PlaitNode.get<MindElement>(board, targetPath);
        expect(target.isCollapsed).toEqual(false);
    });

    it('tab create node', () => {
        let target = PlaitNode.get<MindElement>(board, targetPath);
        expect(target.isCollapsed).toEqual(undefined);
        const event = createKeyboardEvent('keydown', TAB, 'Tab', {});
        board.keyDown(event);
        target = PlaitNode.get<MindElement>(board, targetPath);
        expect(target.children.length).toEqual(2);
    });

    it('do nothing when selected multiple elements', () => {
        let target = PlaitNode.get<MindElement>(board, targetPath);
        const secondTargetPath = [0, 1];
        const secondTarget = PlaitNode.get<MindElement>(board, secondTargetPath);
        addSelectedElement(board, secondTarget);
        const event = createKeyboardEvent('keydown', TAB, 'Tab', {});
        board.keyDown(event);
        expect(target.children.length).toEqual(1);
    });

    it('should expand node when create node through press tab', () => {
        let target = PlaitNode.get<MindElement>(board, targetPath);
        target.isCollapsed = true;
        const event = createKeyboardEvent('keydown', TAB, 'Tab', {});
        board.keyDown(event);
        target = PlaitNode.get<MindElement>(board, targetPath);
        expect(target.children.length).toEqual(2);
        expect(target.isCollapsed).toEqual(false);
    });

    it('press enter to create sibling node', () => {
        const parentPath = Path.parent(targetPath);
        let parent = PlaitNode.get<MindElement>(board, parentPath);
        const childrenCount = parent.children.length;
        const event = createKeyboardEvent('keydown', ENTER, 'Enter', {});
        board.keyDown(event);
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
            board.keyDown(event);
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
            board.keyDown(event);
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
            board.keyDown(event);
            parent = PlaitNode.get<MindElement>(board, parentPath);
            expect(parent.children.length).toEqual(childrenCount);
        });
    });

    it('navigate selected mind node by arrow keys', () => {
        const children = createNavigationTestingChildren();
        board = createTestingBoard([withMindHotkey], children);
        fakeNodeWeakMap(board);
        layoutRoot = fakeMindLayout(board as PlaitBoard & PlaitMindBoard, PlaitNode.get<PlaitMind>(board, [0]));

        const nodeB = PlaitNode.get<MindElement>(board, [0, 0]);
        const nodeC = PlaitNode.get<MindElement>(board, [0, 0, 0]);
        const nodeD = PlaitNode.get<MindElement>(board, [0, 0, 0, 0]);
        const nodeF = PlaitNode.get<MindElement>(board, [0, 1, 0]);

        clearSelectedElement(board);
        addSelectedElement(board, nodeC);
        board.keyDown(createKeyboardEvent('keydown', LEFT_ARROW, 'ArrowLeft', {}));
        expect(getSelectedElements(board)[0]).toBe(nodeB);

        clearSelectedElement(board);
        addSelectedElement(board, nodeC);
        board.keyDown(createKeyboardEvent('keydown', RIGHT_ARROW, 'ArrowRight', {}));
        expect(getSelectedElements(board)[0]).toBe(nodeD);

        clearSelectedElement(board);
        addSelectedElement(board, nodeC);
        board.keyDown(createKeyboardEvent('keydown', DOWN_ARROW, 'ArrowDown', {}));
        expect(getSelectedElements(board)[0]).toBe(nodeF);

        clearSelectedElement(board);
        addSelectedElement(board, nodeF);
        board.keyDown(createKeyboardEvent('keydown', UP_ARROW, 'ArrowUp', {}));
        expect(getSelectedElements(board)[0]).toBe(nodeC);
    });
});
