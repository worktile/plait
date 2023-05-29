import { PlaitBoard, PlaitNode, clearNodeWeakMap, createTestingBoard, fakeNodeWeakMap } from '@plait/core';
import { getCorrespondingAbstract, getOverallAbstracts, getValidAbstractRefs } from './common';
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

    it('get overall corresponding abstracts', () => {
        const first = PlaitNode.get<MindElement>(board, [0, 0]);
        const second = PlaitNode.get<MindElement>(board, [0, 1]);
        const third = PlaitNode.get<MindElement>(board, [0, 2]);
        const abstract = PlaitNode.get<MindElement & AbstractNode>(board, [0, 3]);
        const abstracts1 = getOverallAbstracts(board, [first, second]);
        const abstracts2 = getOverallAbstracts(board, [first, second, third]);
        const abstracts3 = getOverallAbstracts(board, [first, second, abstract]);
        const empty1 = getOverallAbstracts(board, [first, third]);
        const empty2 = getOverallAbstracts(board, [second]);
        expect(abstracts1.length).toEqual(1);
        expect(abstracts2.length).toEqual(1);
        expect(abstracts3.length).toEqual(0);
        expect(abstracts1[0]).toEqual(abstract);
        expect(empty1.length).toEqual(0);
        expect(empty2.length).toEqual(0);
    });

    it('get valid abstract refs', () => {
        const first = PlaitNode.get<MindElement>(board, [0, 0]);
        const second = PlaitNode.get<MindElement>(board, [0, 1]);
        const third = PlaitNode.get<MindElement>(board, [0, 2]);
        const abstract = PlaitNode.get<MindElement & AbstractNode>(board, [0, 3]);
        const abstractRefs1 = getValidAbstractRefs(board, [first, abstract]);
        const abstractRefs2 = getValidAbstractRefs(board, [first, second, abstract]);
        const empty1 = getValidAbstractRefs(board, [first, second, third]);
        const empty2 = getValidAbstractRefs(board, [abstract]);
        expect(abstractRefs1.length).toEqual(1);
        expect(abstractRefs2.length).toEqual(1);
        expect(abstractRefs1[0].references.length).toEqual(1);
        expect(abstractRefs2[0].references.length).toEqual(2);
        expect(empty1.length).toEqual(0);
        expect(empty2.length).toEqual(0);
    });
});
