import {
    Path,
    PlaitBoard,
    PlaitNode,
    addSelectedElement,
    clearNodeWeakMap,
    clearSelectedElement,
    createTestingBoard,
    deleteFragment,
    fakeNodeWeakMap
} from '@plait/core';
import { getTestingChildren } from '../testing/data/basic';
import { createMindElement } from '../utils';
import { MindElement } from '@plait/mind';
import { withMindFragment } from './with-mind-fragment';

describe('with mind fragment plugin', () => {
    let board: PlaitBoard;
    const targetPath = [0, 0];
    beforeEach(() => {
        const child1 = createMindElement('sub child', 40, 20, {});
        const children = getTestingChildren();
        board = createTestingBoard([withMindFragment], children);
        fakeNodeWeakMap(board);

        const parent = PlaitNode.get(board, targetPath);
        parent.children?.push(child1);
        addSelectedElement(board, parent);
    });

    afterEach(() => {
        clearSelectedElement(board);
        clearNodeWeakMap(board);
    });

    describe('should delete selected elements when press backspace or delete', () => {
        it('press backspace', () => {
            const parentPath = Path.parent(targetPath);
            let parent = PlaitNode.get<MindElement>(board, parentPath);
            const childrenCount = parent.children.length;
            deleteFragment(board);
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
            deleteFragment(board);
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
            deleteFragment(board);
            parent = PlaitNode.get<MindElement>(board, parentPath);
            expect(parent.children.length).toEqual(childrenCount - 3);
        });
    });
});
