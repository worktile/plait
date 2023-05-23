import { PlaitBoard, PlaitNode, clearNodeWeakMap, createTestingBoard, fakeNodeWeakMap } from '@plait/core';
import { getCorrespondingAbstract, getOverallAbstracts } from './common';
import { MindElement } from '../../interfaces';
import { AbstractNode } from '@plait/layouts';
import { getTestingChildren } from '../../testing/data/basic';

describe('utils abstract common', () => {
    let board: PlaitBoard;
    beforeEach(() => {
        const children = getTestingChildren();
        board = createTestingBoard([], children);
        fakeNodeWeakMap(board);
    });

    afterEach(() => {
        clearNodeWeakMap(board);
    });

    it('get corresponding abstract', () => {
        const first = PlaitNode.get<MindElement>(board, [0, 0]);
        const third = PlaitNode.get<MindElement>(board, [0, 2]);
        const abstract = PlaitNode.get<MindElement>(board, [0, 3]);
        const firstResult = getCorrespondingAbstract(first);
        const thirdResult = getCorrespondingAbstract(third);
        expect(firstResult).not.toEqual(undefined);
        expect(firstResult).toEqual(abstract);
        expect(thirdResult).toEqual(undefined);
    });
    it('get overall abstracts', () => {
        const first = PlaitNode.get<MindElement>(board, [0, 0]);
        const second = PlaitNode.get<MindElement>(board, [0, 1]);
        const third = PlaitNode.get<MindElement>(board, [0, 2]);
        const abstract = PlaitNode.get<MindElement & AbstractNode>(board, [0, 3]);
        const abstracts1 = getOverallAbstracts(board, [first, second]);
        const abstracts2 = getOverallAbstracts(board, [first, second, third]);
        const empty1 = getOverallAbstracts(board, [first, third]);
        const empty2 = getOverallAbstracts(board, [second]);
        expect(abstracts1.length).toEqual(1);
        expect(abstracts2.length).toEqual(1);
        expect(abstracts1[0]).toEqual(abstract);
        expect(empty1.length).toEqual(0);
        expect(empty2.length).toEqual(0);
    });
});
