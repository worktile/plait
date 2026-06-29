import {
    DOWN_ARROW,
    ENTER,
    LEFT_ARROW,
    NODE_TO_CONTAINER_G,
    Path,
    PlaitBoard,
    PlaitElement,
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
    depthFirstRecursion,
    fakeNodeWeakMap,
    getSelectedElements,
    withOptions,
    withSelection
} from '@plait/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { getTestingChildren } from '../testing/data/basic';
import { withMindHotkey } from './with-mind-hotkey';
import { PlaitMindBoard } from './with-mind.board';
import { createMindElement } from '../utils';
import { MindElement, PlaitMind } from '@plait/mind';
import { fakeMindLayout, clearLayoutNodeWeakMap } from '../testing/core/fake-layout-node';
import { MindNode } from '../interfaces';
import { withMind } from './with-mind';
import { MindLayoutType } from '@plait/layouts';

const createNavigationTestingChildren = (layout?: MindLayoutType): MindElement[] => [
    {
        type: 'mind',
        id: 'A',
        rightNodeCount: 2,
        layout,
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
    let mountedElements: PlaitElement[] = [];
    const targetPath = [0, 0];
    const fakeMountedElements = (root: MindElement) => {
        depthFirstRecursion<MindElement>(root, (node) => {
            NODE_TO_CONTAINER_G.set(node, document.createElementNS('http://www.w3.org/2000/svg', 'g'));
            mountedElements.push(node);
        });
    };
    const createNavigationBoard = (children = createNavigationTestingChildren()) => {
        clearSelectedElement(board);
        clearNodeWeakMap(board);
        board = createTestingBoard([withOptions, withSelection, withMind], children);
        fakeNodeWeakMap(board);
        const root = PlaitNode.get<PlaitMind>(board, [0]);
        layoutRoot = fakeMindLayout(board as PlaitBoard & PlaitMindBoard, root);
        fakeMountedElements(root);
        return root;
    };
    const navigateFrom = (element: MindElement, keyCode: number, key: string) => {
        clearSelectedElement(board);
        addSelectedElement(board, element);
        const event = createKeyboardEvent('keydown', keyCode, key, {});
        board.keyDown(event);
        tick(200);
        return event;
    };

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
        mountedElements.forEach((element) => NODE_TO_CONTAINER_G.delete(element));
        mountedElements = [];
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

    it('navigate selected mind node by arrow keys', fakeAsync(() => {
        createNavigationBoard();

        const nodeB = PlaitNode.get<MindElement>(board, [0, 0]);
        const nodeC = PlaitNode.get<MindElement>(board, [0, 0, 0]);
        const nodeD = PlaitNode.get<MindElement>(board, [0, 0, 0, 0]);
        const nodeF = PlaitNode.get<MindElement>(board, [0, 1, 0]);

        navigateFrom(nodeC, LEFT_ARROW, 'ArrowLeft');
        expect(getSelectedElements(board)[0]).toBe(nodeB);

        navigateFrom(nodeC, RIGHT_ARROW, 'ArrowRight');
        expect(getSelectedElements(board)[0]).toBe(nodeD);

        navigateFrom(nodeC, DOWN_ARROW, 'ArrowDown');
        expect(getSelectedElements(board)[0]).toBe(nodeF);

        navigateFrom(nodeF, UP_ARROW, 'ArrowUp');
        expect(getSelectedElements(board)[0]).toBe(nodeC);
    }));

    it('navigates from the selected root mind by arrow keys', fakeAsync(() => {
        const root = createNavigationBoard();
        const nodeB = PlaitNode.get<MindElement>(board, [0, 0]);

        const rightEvent = navigateFrom(root, RIGHT_ARROW, 'ArrowRight');

        expect(rightEvent.defaultPrevented).toBe(true);
        expect(getSelectedElements(board)[0]).toBe(nodeB);

        const leftEvent = navigateFrom(root, LEFT_ARROW, 'ArrowLeft');

        expect(leftEvent.defaultPrevented).toBe(true);
        expect(getSelectedElements(board)[0]).toBe(root);

        const downEvent = navigateFrom(root, DOWN_ARROW, 'ArrowDown');

        expect(downEvent.defaultPrevented).toBe(true);
        expect(getSelectedElements(board)[0]).toBe(root);
    }));

    it('prefers parent over previous sibling for horizontal structure navigation', fakeAsync(() => {
        const root = createNavigationBoard();
        const nodeB = PlaitNode.get<MindElement>(board, [0, 0]);
        const nodeE = PlaitNode.get<MindElement>(board, [0, 1]);

        const event = navigateFrom(nodeE, LEFT_ARROW, 'ArrowLeft');

        expect(event.defaultPrevented).toBe(true);
        expect(getSelectedElements(board)[0]).not.toBe(nodeB);
        expect(getSelectedElements(board)[0]).toBe(root);
    }));

    it('continues navigating from a root mind selected by arrow navigation', fakeAsync(() => {
        const root = createNavigationBoard();
        const nodeE = PlaitNode.get<MindElement>(board, [0, 1]);

        navigateFrom(nodeE, LEFT_ARROW, 'ArrowLeft');
        expect(getSelectedElements(board)[0]).toBe(root);

        const event = createKeyboardEvent('keydown', RIGHT_ARROW, 'ArrowRight', {});
        board.keyDown(event);
        tick(200);

        expect(event.defaultPrevented).toBe(true);
        expect(getSelectedElements(board)[0]).toBe(nodeE);
    }));

    it('does not navigate into hidden descendants or distant geometry candidates', fakeAsync(() => {
        const children = createNavigationTestingChildren();
        children[0].children[0].children[0].isCollapsed = true;
        createNavigationBoard(children);
        const nodeC = PlaitNode.get<MindElement>(board, [0, 0, 0]);
        const nodeD = PlaitNode.get<MindElement>(board, [0, 0, 0, 0]);

        const event = navigateFrom(nodeC, RIGHT_ARROW, 'ArrowRight');

        expect(event.defaultPrevented).toBe(true);
        expect(getSelectedElements(board)[0]).not.toBe(nodeD);
        expect(getSelectedElements(board)[0]).toBe(nodeC);
    }));

    it('prevents default behavior when no navigation candidate exists', fakeAsync(() => {
        createNavigationBoard();
        const nodeD = PlaitNode.get<MindElement>(board, [0, 0, 0, 0]);

        const event = navigateFrom(nodeD, RIGHT_ARROW, 'ArrowRight');

        expect(event.defaultPrevented).toBe(true);
        expect(getSelectedElements(board)[0]).toBe(nodeD);
    }));

    it('navigates visible siblings in indented layout', fakeAsync(() => {
        createNavigationBoard(createNavigationTestingChildren(MindLayoutType.rightBottomIndented));
        const nodeB = PlaitNode.get<MindElement>(board, [0, 0]);
        const nodeE = PlaitNode.get<MindElement>(board, [0, 1]);

        navigateFrom(nodeB, DOWN_ARROW, 'ArrowDown');

        expect(getSelectedElements(board)[0]).toBe(nodeE);
    }));
});
