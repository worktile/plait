import { PlaitBoard, PlaitElement, PlaitNode, clearNodeWeakMap, createTestingBoard, fakeNodeWeakMap } from '@plait/core';
import { getCorrespondingAbstract, getOverallAbstracts } from './common';
import { MindElement } from '../../interfaces';
import { AbstractNode } from '@plait/layouts';

describe('abstract common', () => {
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

export const getTestingChildren = (): PlaitElement[] => {
    return [
        {
            type: 'mindmap',
            id: 'DJCxA',
            rightNodeCount: 3,
            data: { topic: { children: [{ text: '脑图调研' }] } },
            children: [
                { id: 'HcJWT', data: { topic: { children: [{ text: '1-1' }] } }, children: [], width: 19, height: 20 },
                { id: 'xAWFi', data: { topic: { children: [{ text: '2-2' }] } }, children: [], width: 25, height: 20 },
                { id: 'yTTcb', data: { topic: { children: [{ text: '3-3' }] } }, children: [], width: 25, height: 20 },
                {
                    id: 'PYTyJ',
                    data: { topic: { children: [{ text: '概要' }] } },
                    children: [],
                    width: 28,
                    height: 20,
                    strokeColor: '#AAAAAA',
                    strokeWidth: 2,
                    branchColor: '#AAAAAA',
                    branchWidth: 2,
                    start: 0,
                    end: 1
                }
            ],
            width: 72,
            height: 25,
            isRoot: true,
            points: [[1117, 590]],
            isCollapsed: false
        }
    ];
};
