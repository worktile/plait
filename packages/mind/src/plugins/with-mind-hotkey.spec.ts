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
import { createMindElement, getRectangleByNode } from '../utils';
import { MindElement, PlaitMind } from '@plait/mind';
import { fakeMindLayout, clearLayoutNodeWeakMap } from '../testing/core/fake-layout-node';
import { LayoutDirection, MindNode } from '../interfaces';
import { withMind } from './with-mind';
import { MindLayoutType } from '@plait/layouts';
import { resolveLayoutRelationDirection } from '../utils/position/layout-direction';

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

const createNestedNavigationTestingChildren = (outerLayout = MindLayoutType.rightTopIndented, nestedLayout = MindLayoutType.right) => {
    const children = createNavigationTestingChildren(outerLayout);
    const nestedLayoutRoot = children[0].children[0];
    nestedLayoutRoot.layout = nestedLayout;
    nestedLayoutRoot.children.push({
        id: 'H',
        type: 'mind_child',
        data: { topic: { children: [{ text: 'H' }] } },
        children: []
    });
    nestedLayoutRoot.children.push({
        id: 'I',
        type: 'mind_child',
        data: { topic: { children: [{ text: 'I' }] } },
        children: []
    });
    return children;
};

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

    it('uses the parent relation for horizontal structure navigation', fakeAsync(() => {
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

    it('does not navigate into hidden descendants or elements outside the navigation lane', fakeAsync(() => {
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

    it('keeps visible traversal order when geometry candidates have equal movement-axis distance', fakeAsync(() => {
        createNavigationBoard();
        const source = PlaitNode.get<MindElement>(board, [0, 0, 0, 0]);
        const firstCandidate = PlaitNode.get<MindElement>(board, [0, 1, 0, 0]);
        const secondCandidate = PlaitNode.get<MindElement>(board, [0, 1, 0]);
        const sourceNode = MindElement.getNode(source);
        const firstCandidateNode = MindElement.getNode(firstCandidate);
        const secondCandidateNode = MindElement.getNode(secondCandidate);
        const sourceRectangle = getRectangleByNode(sourceNode);
        const firstCandidateRectangle = getRectangleByNode(firstCandidateNode);
        const secondCandidateRectangle = getRectangleByNode(secondCandidateNode);
        const targetCenterY = sourceRectangle.y + sourceRectangle.height / 2 + 100;

        firstCandidateNode.x = sourceRectangle.x + sourceRectangle.width - 1 - firstCandidateNode.hGap;
        firstCandidateNode.y = targetCenterY - firstCandidateRectangle.height / 2 - firstCandidateNode.vGap;
        secondCandidateNode.x =
            sourceRectangle.x + sourceRectangle.width / 2 - secondCandidateRectangle.width / 2 - secondCandidateNode.hGap;
        secondCandidateNode.y = targetCenterY - secondCandidateRectangle.height / 2 - secondCandidateNode.vGap;

        navigateFrom(source, DOWN_ARROW, 'ArrowDown');

        expect(getSelectedElements(board)[0]).toBe(firstCandidate);
    }));

    it('prevents default behavior when no navigation candidate exists', fakeAsync(() => {
        createNavigationBoard();
        const nodeD = PlaitNode.get<MindElement>(board, [0, 0, 0, 0]);

        const event = navigateFrom(nodeD, RIGHT_ARROW, 'ArrowRight');

        expect(event.defaultPrevented).toBe(true);
        expect(getSelectedElements(board)[0]).toBe(nodeD);
    }));

    it('navigates standard siblings across the right and left branch boundary', fakeAsync(() => {
        const children = createNavigationTestingChildren();
        children[0].rightNodeCount = 2;
        children[0].children.push(
            {
                id: 'H',
                type: 'mind_child',
                data: { topic: { children: [{ text: 'H' }] } },
                children: []
            },
            {
                id: 'I',
                type: 'mind_child',
                data: { topic: { children: [{ text: 'I' }] } },
                children: []
            }
        );
        createNavigationBoard(children);
        const nodeB = PlaitNode.get<MindElement>(board, [0, 0]);
        const nodeE = PlaitNode.get<MindElement>(board, [0, 1]);
        const nodeH = PlaitNode.get<MindElement>(board, [0, 2]);
        const nodeI = PlaitNode.get<MindElement>(board, [0, 3]);

        navigateFrom(nodeB, DOWN_ARROW, 'ArrowDown');
        expect(getSelectedElements(board)[0]).toBe(nodeE);

        navigateFrom(nodeE, DOWN_ARROW, 'ArrowDown');
        expect(getSelectedElements(board)[0]).toBe(nodeH);

        navigateFrom(nodeH, UP_ARROW, 'ArrowUp');
        expect(getSelectedElements(board)[0]).toBe(nodeE);

        navigateFrom(nodeH, DOWN_ARROW, 'ArrowDown');
        expect(getSelectedElements(board)[0]).toBe(nodeI);

        navigateFrom(nodeI, UP_ARROW, 'ArrowUp');
        expect(getSelectedElements(board)[0]).toBe(nodeH);

        navigateFrom(nodeE, UP_ARROW, 'ArrowUp');
        expect(getSelectedElements(board)[0]).toBe(nodeB);
    }));

    it('navigates parent, child and siblings by upward layout direction', fakeAsync(() => {
        const root = createNavigationBoard(createNavigationTestingChildren(MindLayoutType.upward));
        const nodeB = PlaitNode.get<MindElement>(board, [0, 0]);
        const nodeE = PlaitNode.get<MindElement>(board, [0, 1]);
        const nodeF = PlaitNode.get<MindElement>(board, [0, 1, 0]);

        navigateFrom(nodeE, UP_ARROW, 'ArrowUp');
        expect(getSelectedElements(board)[0]).toBe(nodeF);

        navigateFrom(nodeE, DOWN_ARROW, 'ArrowDown');
        expect(getSelectedElements(board)[0]).toBe(root);

        navigateFrom(nodeE, LEFT_ARROW, 'ArrowLeft');
        expect(getSelectedElements(board)[0]).toBe(nodeB);

        navigateFrom(nodeB, RIGHT_ARROW, 'ArrowRight');
        expect(getSelectedElements(board)[0]).toBe(nodeE);
    }));

    it('navigates parent, child and siblings by indented layout direction', fakeAsync(() => {
        const root = createNavigationBoard(createNavigationTestingChildren(MindLayoutType.rightBottomIndented));
        const nodeB = PlaitNode.get<MindElement>(board, [0, 0]);
        const nodeC = PlaitNode.get<MindElement>(board, [0, 0, 0]);
        const nodeE = PlaitNode.get<MindElement>(board, [0, 1]);

        navigateFrom(root, DOWN_ARROW, 'ArrowDown');
        expect(getSelectedElements(board)[0]).toBe(nodeB);

        navigateFrom(nodeB, UP_ARROW, 'ArrowUp');
        expect(getSelectedElements(board)[0]).toBe(root);

        navigateFrom(root, DOWN_ARROW, 'ArrowDown');
        expect(getSelectedElements(board)[0]).toBe(nodeB);

        navigateFrom(nodeB, RIGHT_ARROW, 'ArrowRight');
        expect(getSelectedElements(board)[0]).toBe(nodeC);

        navigateFrom(nodeC, LEFT_ARROW, 'ArrowLeft');
        expect(getSelectedElements(board)[0]).toBe(nodeB);

        navigateFrom(nodeB, DOWN_ARROW, 'ArrowDown');
        expect(getSelectedElements(board)[0]).toBe(nodeE);

        navigateFrom(nodeE, UP_ARROW, 'ArrowUp');
        expect(getSelectedElements(board)[0]).toBe(nodeB);
    }));

    it('navigates parent, child and siblings by top indented layout direction', fakeAsync(() => {
        const root = createNavigationBoard(createNavigationTestingChildren(MindLayoutType.rightTopIndented));
        const nodeB = PlaitNode.get<MindElement>(board, [0, 0]);
        const nodeC = PlaitNode.get<MindElement>(board, [0, 0, 0]);
        const nodeE = PlaitNode.get<MindElement>(board, [0, 1]);
        const nodeF = PlaitNode.get<MindElement>(board, [0, 1, 0]);

        navigateFrom(root, UP_ARROW, 'ArrowUp');
        expect(getSelectedElements(board)[0]).toBe(nodeB);

        navigateFrom(nodeB, UP_ARROW, 'ArrowUp');
        expect(getSelectedElements(board)[0]).toBe(nodeE);

        navigateFrom(nodeE, DOWN_ARROW, 'ArrowDown');
        expect(getSelectedElements(board)[0]).toBe(nodeB);

        navigateFrom(nodeB, LEFT_ARROW, 'ArrowLeft');
        expect(getSelectedElements(board)[0]).toBe(nodeB);

        navigateFrom(nodeB, DOWN_ARROW, 'ArrowDown');
        expect(getSelectedElements(board)[0]).toBe(root);

        navigateFrom(root, UP_ARROW, 'ArrowUp');
        expect(getSelectedElements(board)[0]).toBe(nodeB);

        navigateFrom(nodeB, RIGHT_ARROW, 'ArrowRight');
        expect(getSelectedElements(board)[0]).toBe(nodeC);

        navigateFrom(nodeC, LEFT_ARROW, 'ArrowLeft');
        expect(getSelectedElements(board)[0]).toBe(nodeB);

        navigateFrom(nodeE, RIGHT_ARROW, 'ArrowRight');
        expect(getSelectedElements(board)[0]).toBe(nodeF);

        navigateFrom(nodeF, LEFT_ARROW, 'ArrowLeft');
        expect(getSelectedElements(board)[0]).toBe(nodeE);
    }));

    it('uses the outer parent-child context for a nested layout root', fakeAsync(() => {
        const root = createNavigationBoard(createNestedNavigationTestingChildren());
        const nestedLayoutRoot = PlaitNode.get<MindElement>(board, [0, 0]);

        navigateFrom(root, UP_ARROW, 'ArrowUp');
        expect(getSelectedElements(board)[0]).toBe(nestedLayoutRoot);

        navigateFrom(nestedLayoutRoot, DOWN_ARROW, 'ArrowDown');
        expect(getSelectedElements(board)[0]).toBe(root);
    }));

    it('resolves nested relationship directions from each layout owner', () => {
        const root = createNavigationBoard(createNestedNavigationTestingChildren());
        const nestedLayoutRoot = PlaitNode.get<MindElement>(board, [0, 0]);
        const nestedChild = PlaitNode.get<MindElement>(board, [0, 0, 0]);

        expect(
            resolveLayoutRelationDirection(board, {
                type: 'parent-child',
                parent: root,
                child: nestedLayoutRoot
            })
        ).toBe(LayoutDirection.top);
        expect(
            resolveLayoutRelationDirection(board, {
                type: 'sibling',
                parent: root,
                order: 'next'
            })
        ).toBe(LayoutDirection.top);
        expect(
            resolveLayoutRelationDirection(board, {
                type: 'sibling',
                parent: root,
                order: 'previous'
            })
        ).toBe(LayoutDirection.bottom);
        expect(
            resolveLayoutRelationDirection(board, {
                type: 'parent-child',
                parent: nestedLayoutRoot,
                child: nestedChild
            })
        ).toBe(LayoutDirection.right);
        expect(
            resolveLayoutRelationDirection(board, {
                type: 'sibling',
                parent: nestedLayoutRoot,
                order: 'next'
            })
        ).toBe(LayoutDirection.top);
        expect(
            resolveLayoutRelationDirection(board, {
                type: 'sibling',
                parent: nestedLayoutRoot,
                order: 'previous'
            })
        ).toBe(LayoutDirection.bottom);
    });

    it('uses the outer sibling context at a nested layout boundary', fakeAsync(() => {
        createNavigationBoard(createNestedNavigationTestingChildren());
        const nestedLayoutRoot = PlaitNode.get<MindElement>(board, [0, 0]);
        const nextOuterSibling = PlaitNode.get<MindElement>(board, [0, 1]);

        navigateFrom(nestedLayoutRoot, UP_ARROW, 'ArrowUp');
        expect(getSelectedElements(board)[0]).toBe(nextOuterSibling);

        navigateFrom(nextOuterSibling, DOWN_ARROW, 'ArrowDown');
        expect(getSelectedElements(board)[0]).toBe(nestedLayoutRoot);
    }));

    it('uses the nested layout context for descendant navigation', fakeAsync(() => {
        createNavigationBoard(createNestedNavigationTestingChildren());
        const nestedLayoutRoot = PlaitNode.get<MindElement>(board, [0, 0]);
        const firstChild = PlaitNode.get<MindElement>(board, [0, 0, 0]);
        const firstGrandchild = PlaitNode.get<MindElement>(board, [0, 0, 0, 0]);
        const secondChild = PlaitNode.get<MindElement>(board, [0, 0, 1]);
        const thirdChild = PlaitNode.get<MindElement>(board, [0, 0, 2]);

        navigateFrom(nestedLayoutRoot, RIGHT_ARROW, 'ArrowRight');
        expect(getSelectedElements(board)[0]).toBe(firstChild);

        navigateFrom(firstChild, RIGHT_ARROW, 'ArrowRight');
        expect(getSelectedElements(board)[0]).toBe(firstGrandchild);

        navigateFrom(firstGrandchild, LEFT_ARROW, 'ArrowLeft');
        expect(getSelectedElements(board)[0]).toBe(firstChild);

        navigateFrom(firstChild, UP_ARROW, 'ArrowUp');
        expect(getSelectedElements(board)[0]).toBe(secondChild);

        navigateFrom(secondChild, UP_ARROW, 'ArrowUp');
        expect(getSelectedElements(board)[0]).toBe(thirdChild);

        navigateFrom(thirdChild, DOWN_ARROW, 'ArrowDown');
        expect(getSelectedElements(board)[0]).toBe(secondChild);

        navigateFrom(secondChild, DOWN_ARROW, 'ArrowDown');
        expect(getSelectedElements(board)[0]).toBe(firstChild);

        navigateFrom(firstChild, LEFT_ARROW, 'ArrowLeft');
        expect(getSelectedElements(board)[0]).toBe(nestedLayoutRoot);
    }));

    it('uses the rendered horizontal mirror for vertical-layout siblings', fakeAsync(() => {
        createNavigationBoard(createNestedNavigationTestingChildren(MindLayoutType.left, MindLayoutType.downward));
        const nestedLayoutRoot = PlaitNode.get<MindElement>(board, [0, 0]);
        const firstChild = PlaitNode.get<MindElement>(board, [0, 0, 0]);
        const secondChild = PlaitNode.get<MindElement>(board, [0, 0, 1]);
        const thirdChild = PlaitNode.get<MindElement>(board, [0, 0, 2]);

        expect(
            resolveLayoutRelationDirection(board, {
                type: 'sibling',
                parent: nestedLayoutRoot,
                order: 'next'
            })
        ).toBe(LayoutDirection.left);

        navigateFrom(firstChild, LEFT_ARROW, 'ArrowLeft');
        expect(getSelectedElements(board)[0]).toBe(secondChild);

        navigateFrom(secondChild, LEFT_ARROW, 'ArrowLeft');
        expect(getSelectedElements(board)[0]).toBe(thirdChild);

        navigateFrom(thirdChild, RIGHT_ARROW, 'ArrowRight');
        expect(getSelectedElements(board)[0]).toBe(secondChild);

        navigateFrom(secondChild, RIGHT_ARROW, 'ArrowRight');
        expect(getSelectedElements(board)[0]).toBe(firstChild);
    }));

    it('uses geometry fallback across indented hierarchy boundaries', fakeAsync(() => {
        const children = createNavigationTestingChildren(MindLayoutType.rightTopIndented);
        children[0].children[0].children.push({
            id: 'H',
            type: 'mind_child',
            data: { topic: { children: [{ text: 'H' }] } },
            children: []
        });
        children[0].children[0].children[0].children.push({
            id: 'I',
            type: 'mind_child',
            data: { topic: { children: [{ text: 'I' }] } },
            children: []
        });
        createNavigationBoard(children);
        const nodeB = PlaitNode.get<MindElement>(board, [0, 0]);
        const nodeC = PlaitNode.get<MindElement>(board, [0, 0, 0]);
        const nodeD = PlaitNode.get<MindElement>(board, [0, 0, 0, 0]);
        const nodeF = PlaitNode.get<MindElement>(board, [0, 1, 0]);
        const nodeG = PlaitNode.get<MindElement>(board, [0, 1, 0, 0]);
        const nodeH = PlaitNode.get<MindElement>(board, [0, 0, 1]);
        const nodeI = PlaitNode.get<MindElement>(board, [0, 0, 0, 1]);

        navigateFrom(nodeI, UP_ARROW, 'ArrowUp');
        expect(getSelectedElements(board)[0]).toBe(nodeG);

        navigateFrom(nodeI, DOWN_ARROW, 'ArrowDown');
        expect(getSelectedElements(board)[0]).toBe(nodeD);

        navigateFrom(nodeH, UP_ARROW, 'ArrowUp');
        expect(getSelectedElements(board)[0]).toBe(nodeF);

        navigateFrom(nodeH, DOWN_ARROW, 'ArrowDown');
        expect(getSelectedElements(board)[0]).toBe(nodeC);

        navigateFrom(nodeC, LEFT_ARROW, 'ArrowLeft');
        expect(getSelectedElements(board)[0]).toBe(nodeB);
    }));
});
