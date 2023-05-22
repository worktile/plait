import { PlaitElement, createTestingBoard } from '@plait/core';
import { getCorrespondingAbstract } from './common';

export const getTestingChildren = () => {
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

describe('abstract common', () => {
    it('get corresponding abstract', () => {
        const children = getTestingChildren();
        const first = children[0].children[0];
        const third = children[0].children[2];
        const abstract = children[0].children[3];
        createTestingBoard([], (children as unknown) as PlaitElement[]);
        const firstResult = getCorrespondingAbstract(first);
        const thirdResult = getCorrespondingAbstract(third);
        expect(firstResult).toEqual(abstract);
        expect(thirdResult).toEqual(undefined);
    });
});
