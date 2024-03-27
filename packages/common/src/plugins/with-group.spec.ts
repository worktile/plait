import {
    PlaitBoard,
    PlaitElement,
    addSelectedElement,
    clearNodeWeakMap,
    clearSelectedElement,
    createTestingBoard,
    deleteFragment,
    fakeNodeWeakMap
} from '@plait/core';
import { withGroup } from './with-group';

const group1: PlaitElement[] = [
    {
        id: 'tWhsP',
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
            [-181.23046875, -48.61328125],
            [-41.57421875, 20.76171875]
        ],
        strokeWidth: 2,
        groupId: 'hytfJ'
    },
    {
        id: 'wdaQi',
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
            [76.59765625, -13.92578125],
            [216.25390625, 55.44921875]
        ],
        strokeWidth: 2,
        groupId: 'hytfJ'
    },
    {
        id: 'hytfJ',
        type: 'group'
    }
];

const group2: PlaitElement[] = [
    {
        id: 'eRthC',
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
            [-151.5859375, -77.71484375],
            [-24.19140625, -16.37890625]
        ],
        strokeWidth: 2,
        groupId: 'WtXEf'
    },
    {
        id: 'HCMPk',
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
            [51.275390625, -80.01953125],
            [178.669921875, -18.68359375]
        ],
        strokeWidth: 2,
        groupId: 'WtXEf'
    },
    {
        id: 'WtXEf',
        type: 'group',
        groupId: 'yjckS'
    },
    {
        id: 'PQxAX',
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
            [-95.3408203125, 9.16015625],
            [26.2216796875, 85.09375]
        ],
        strokeWidth: 2,
        groupId: 'yjckS'
    },
    {
        id: 'yjckS',
        type: 'group'
    }
];
const children: PlaitElement[] = [...group1, ...group2];

describe('with group plugin', () => {
    let board: PlaitBoard;
    beforeEach(() => {
        board = createTestingBoard([withGroup], children);
        fakeNodeWeakMap(board);
    });

    afterEach(() => {
        clearNodeWeakMap(board);
    });

    it('should remove the group if there is only one element left within after deletion', () => {
        addSelectedElement(board, [board.children[0]]);
        deleteFragment(board);
        const group = board.children.find(item => item.id === board.children[0].groupId);
        expect(group).toBe(undefined);
    });

    it('should update element groupId if there is only one element left within after deletion', () => {
        addSelectedElement(board, [board.children[4]]);
        deleteFragment(board);
        const group = board.children.find(item => item.id === board.children[4].groupId);
        expect(group).toBe(undefined);
        expect(board.children[3].groupId).toBe(group2[group2.length - 1].id);

        clearSelectedElement(board);
        addSelectedElement(board, [board.children[0]]);
        deleteFragment(board);
        expect(board.children[1].groupId).toBe(undefined);
    });
});
