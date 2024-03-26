import { PlaitGroupElement } from '@plait/core';
import { PlaitBoard, PlaitElement } from '../interfaces';
import { clearNodeWeakMap, createTestingBoard, fakeNodeWeakMap } from '../testing';
import { addSelectedElement } from '../utils';
import { GroupTransforms } from './group';

const children: PlaitElement[] = [
    {
        id: 'mnwsQ',
        type: 'geometry',
        shape: 'rectangle',
        angle: 0,
        opacity: 1,
        textHeight: 20,
        text: {
            children: [
                {
                    text: ''
                }
            ],
            align: 'center'
        },
        points: [
            [-141.96484375, -125.28125],
            [-20.140625, -62.87109375]
        ],
        strokeWidth: 2,
        groupId: 'DQpaJ'
    },
    {
        id: 'DPMaD',
        type: 'geometry',
        shape: 'rectangle',
        angle: 0,
        opacity: 1,
        textHeight: 20,
        text: {
            children: [
                {
                    text: ''
                }
            ],
            align: 'center'
        },
        points: [
            [103.947265625, -104.076171875],
            [225.771484375, -41.666015625]
        ],
        strokeWidth: 2,
        groupId: 'DQpaJ'
    },
    {
        id: 'DQpaJ',
        type: 'group'
    },
    {
        id: 'JRnNj',
        type: 'geometry',
        shape: 'rectangle',
        angle: 0,
        opacity: 1,
        textHeight: 20,
        text: {
            children: [
                {
                    text: ''
                }
            ],
            align: 'center'
        },
        points: [
            [166.896484375, 123.013671875],
            [273.189453125, 199.064453125]
        ],
        strokeWidth: 2
    }
];

describe('group transform', () => {
    let board: PlaitBoard;
    beforeEach(() => {
        board = createTestingBoard([], children);
        fakeNodeWeakMap(board);
    });

    afterEach(() => {
        clearNodeWeakMap(board);
    });

    it('should correctly set group when select group and element without group', () => {
        addSelectedElement(board, children);
        GroupTransforms.addGroup(board);
        expect(board.children.length).toBe(5);
        const groups = board.children.filter(item=> PlaitGroupElement.isGroup(item));
        expect(groups.length).toBe(2);
        const lastElement = board.children[board.children.length-1];
        expect(lastElement.groupId).toBe(undefined);
        expect(board.children[2].groupId).toBe(lastElement.id);
        expect(board.children[3].groupId).toBe(lastElement.id);
    });

    it('should correctly remove group when select group', () => {
        addSelectedElement(board, children);
        GroupTransforms.removeGroup(board);
        expect(board.children.length).toBe(3);
        const elementIngroup = board.children.filter(item=> item.groupId);
        expect(elementIngroup.length).toBe(0);
    });
});
