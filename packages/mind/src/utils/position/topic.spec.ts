import { PlaitNode, clearNodeWeakMap, createTestingBoard, fakeNodeWeakMap } from '@plait/core';
import { getTestingChildren } from '../../testing/data/basic';
import { fakeMindLayout, clearLayoutNodeWeakMap } from '../../testing/core/fake-layout-node';
import { PlaitMindBoard } from '../../plugins/with-extend-mind';
import { MindElement, PlaitMind } from '../../interfaces/element';
import { MindNode } from '../../interfaces/node';
import { getTopicRectangleByNode } from './topic';
import { getRectangleByNode } from './node';
import { NodeSpace } from '../space/node-space';

describe('utils position topic', () => {
    let board: PlaitMindBoard;
    let root: MindNode;
    beforeEach(() => {
        const children = getTestingChildren();
        board = createTestingBoard([], children) as PlaitMindBoard;
        const mind = PlaitNode.get<PlaitMind>(board, [0]);
        fakeNodeWeakMap(board);
        root = fakeMindLayout(board, mind)
    });

    afterEach(() => {
        clearNodeWeakMap(board);
        clearLayoutNodeWeakMap(root);
    });

    it('get topic rectangle by node', () => {
        const mind = PlaitNode.get<PlaitMind>(board, [0]);
        const mindNode = MindElement.getNode(mind);

        // logic
        let { x, y } = getRectangleByNode(mindNode);
        x = x + NodeSpace.getTextLeftSpace(board, mindNode.origin);
        y = y + NodeSpace.getTextTopSpace(mindNode.origin);

        const rectangle1 = getTopicRectangleByNode(board, mindNode);
        expect(rectangle1.x).toEqual(x);
        expect(rectangle1.y).toEqual(y);
        expect(rectangle1.width).toEqual(Math.ceil(mindNode.origin.width));
        expect(rectangle1.height).toEqual(mindNode.origin.height);
    });
});
