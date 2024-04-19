import { PlaitBoard, PlaitElement } from '../interfaces';
import { clearNodeWeakMap, createTestingBoard, fakeNodeWeakMap } from '../testing';
import { addSelectedElement } from '../utils';
import { ZIndexTransforms } from './z-index';

const children: PlaitElement[] = [
    {
        id: 'fHsir',
        data: {
            topic: {
                children: [
                    {
                        text: '思维导图'
                    }
                ]
            }
        },
        children: [
            {
                id: 'PjhrX',
                data: {
                    topic: {
                        children: [
                            {
                                text: ''
                            }
                        ]
                    }
                },
                children: [],
                width: 14,
                height: 20
            }
        ],
        width: 72,
        height: 25,
        layout: 'right',
        isRoot: true,
        type: 'mindmap',
        points: [[626, -306.5]]
    },

    {
        id: 'NjJRn',
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
    },
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
        id: 'sQmnw',
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
            [-241.96484375, -225.28125],
            [-30.140625, -162.87109375]
        ],
        strokeWidth: 2,
        groupId: 'JDQpa'
    },
    {
        id: 'DPMsD',
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
            [203.947265625, -204.076171875],
            [325.771484375, -141.666015625]
        ],
        strokeWidth: 2,
        groupId: 'JDQpa'
    },
    {
        id: 'JDQpa',
        type: 'group'
    },
    {
        id: 'JNjRn',
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

describe('zIndex transform', () => {
    let board: PlaitBoard;
    beforeEach(() => {
        board = createTestingBoard([], children);
        fakeNodeWeakMap(board);
    });

    afterEach(() => {
        clearNodeWeakMap(board);
    });

    describe('moveToTop', () => {
        it('singe select element', () => {
            addSelectedElement(board, children[0]);
            ZIndexTransforms.moveToTop(board);
            expect(board.children[board.children.length - 1].id).toBe(children[0].id);
        });

        it('multiple select elements', () => {
            addSelectedElement(board, [children[0], children[0].children![0], children[1]]);
            ZIndexTransforms.moveToTop(board);
            expect(board.children[board.children.length - 2].id).toBe(children[0].id);
            expect(board.children[board.children.length - 1].id).toBe(children[1].id);
        });

        it('singe select group', () => {
            addSelectedElement(board, [children[2], children[3]]);
            ZIndexTransforms.moveToTop(board);
            expect(board.children[board.children.length - 2].id).toBe(children[2].id);
            expect(board.children[board.children.length - 1].id).toBe(children[3].id);
        });

        it('multiple select group', () => {
            addSelectedElement(board, [children[2], children[3], children[5], children[6]]);
            ZIndexTransforms.moveToTop(board);
            expect(board.children[board.children.length - 4].id).toBe(children[2].id);
            expect(board.children[board.children.length - 3].id).toBe(children[3].id);
            expect(board.children[board.children.length - 2].id).toBe(children[5].id);
            expect(board.children[board.children.length - 1].id).toBe(children[6].id);
        });

        it('select element and all element in group', () => {
            addSelectedElement(board, [children[0], children[2], children[3]]);
            ZIndexTransforms.moveToTop(board);
            expect(board.children[board.children.length - 3].id).toBe(children[0].id);
            expect(board.children[board.children.length - 2].id).toBe(children[2].id);
            expect(board.children[board.children.length - 1].id).toBe(children[3].id);
        });

        it('select element and partial element in group', () => {
            addSelectedElement(board, [children[0], children[2]]);
            ZIndexTransforms.moveToTop(board);
            expect(board.children[3].id).toBe(children[2].id);
            expect(board.children[board.children.length - 1].id).toBe(children[0].id);
        });
    });

    describe('moveToBottom', () => {
        it('singe select element', () => {
            addSelectedElement(board, children[children.length - 1]);
            ZIndexTransforms.moveToBottom(board);
            expect(board.children[0].id).toBe(children[children.length - 1].id);
        });

        it('multiple select elements', () => {
            addSelectedElement(board, [children[1], children[children.length - 1]]);
            ZIndexTransforms.moveToBottom(board);
            expect(board.children[0].id).toBe(children[1].id);
            expect(board.children[1].id).toBe(children[children.length - 1].id);
        });

        it('singe select group', () => {
            addSelectedElement(board, [children[5], children[6]]);
            ZIndexTransforms.moveToBottom(board);
            expect(board.children[0].id).toBe(children[5].id);
            expect(board.children[1].id).toBe(children[6].id);
        });

        it('multiple select group', () => {
            addSelectedElement(board, [children[2], children[3], children[5], children[6]]);
            ZIndexTransforms.moveToBottom(board);
            expect(board.children[0].id).toBe(children[2].id);
            expect(board.children[1].id).toBe(children[3].id);
            expect(board.children[2].id).toBe(children[5].id);
            expect(board.children[3].id).toBe(children[6].id);
        });

        it('select element and all element in group', () => {
            addSelectedElement(board, [children[5], children[6], children[children.length - 1]]);
            ZIndexTransforms.moveToBottom(board);
            expect(board.children[0].id).toBe(children[5].id);
            expect(board.children[1].id).toBe(children[6].id);
            expect(board.children[2].id).toBe(children[children.length - 1].id);
        });

        it('select element and partial element in group', () => {
            addSelectedElement(board, [children[3], children[children.length - 1]]);
            ZIndexTransforms.moveToBottom(board);
            expect(board.children[2].id).toBe(children[3].id);
            expect(board.children[0].id).toBe(children[children.length - 1].id);
        });
    });

    describe('moveUp', () => {
        it('singe select element', () => {
            addSelectedElement(board, children[0]);
            ZIndexTransforms.moveUp(board);
            expect(board.children[1].id).toBe(children[0].id);
        });

        it('multiple select elements', () => {
            addSelectedElement(board, [children[0], children[1]]);
            ZIndexTransforms.moveUp(board);
            expect(board.children[2].id).toBe(children[0].id);
            expect(board.children[3].id).toBe(children[1].id);
        });

        it('singe select group', () => {
            addSelectedElement(board, [children[2], children[3]]);
            ZIndexTransforms.moveUp(board);
            expect(board.children[5].id).toBe(children[2].id);
            expect(board.children[6].id).toBe(children[3].id);
        });

        it('multiple select group', () => {
            addSelectedElement(board, [children[2], children[3], children[5], children[6]]);
            ZIndexTransforms.moveUp(board);
            expect(board.children[5].id).toBe(children[2].id);
            expect(board.children[6].id).toBe(children[3].id);
            expect(board.children[7].id).toBe(children[5].id);
            expect(board.children[8].id).toBe(children[6].id);
        });

        it('select element and all element in group', () => {
            addSelectedElement(board, [children[0], children[2], children[3]]);
            ZIndexTransforms.moveUp(board);
            expect(board.children[1].id).toBe(children[0].id);
            expect(board.children[5].id).toBe(children[2].id);
            expect(board.children[6].id).toBe(children[3].id);
        });

        it('select element and partial element in group', () => {
            addSelectedElement(board, [children[0], children[2]]);
            ZIndexTransforms.moveUp(board);
            expect(board.children[1].id).toBe(children[0].id);
            expect(board.children[3].id).toBe(children[2].id);
        });

        it('both select partial element in different group', () => {
            addSelectedElement(board, [children[2], children[5]]);
            ZIndexTransforms.moveUp(board);
            expect(board.children[3].id).toBe(children[2].id);
            expect(board.children[6].id).toBe(children[5].id);
        });
    });

    describe('moveDown', () => {
        it('singe select element', () => {
            addSelectedElement(board, children[1]);
            ZIndexTransforms.moveDown(board);
            expect(board.children[0].id).toBe(children[1].id);
        });

        it('multiple select elements', () => {
            addSelectedElement(board, [children[0], children[children.length - 1]]);
            ZIndexTransforms.moveDown(board);
            expect(board.children[0].id).toBe(children[0].id);
            expect(board.children[5].id).toBe(children[children.length - 1].id);
        });

        it('singe select group', () => {
            addSelectedElement(board, [children[5], children[6]]);
            ZIndexTransforms.moveDown(board);
            expect(board.children[2].id).toBe(children[5].id);
            expect(board.children[3].id).toBe(children[6].id);
        });

        it('multiple select group', () => {
            addSelectedElement(board, [children[2], children[3], children[5], children[6]]);
            ZIndexTransforms.moveDown(board);
            expect(board.children[1].id).toBe(children[2].id);
            expect(board.children[2].id).toBe(children[3].id);
            expect(board.children[3].id).toBe(children[5].id);
            expect(board.children[4].id).toBe(children[6].id);
        });

        it('select element and all element in group', () => {
            addSelectedElement(board, [children[5], children[6], children[children.length - 1]]);
            ZIndexTransforms.moveDown(board);
            expect(board.children[2].id).toBe(children[5].id);
            expect(board.children[3].id).toBe(children[6].id);
            expect(board.children[4].id).toBe(children[children.length - 1].id);
        });

        it('select element and partial element in group', () => {
            addSelectedElement(board, [children[6], children[children.length - 1]]);
            ZIndexTransforms.moveDown(board);
            expect(board.children[5].id).toBe(children[children.length - 1].id);
            expect(board.children[6].id).toBe(children[6].id);
            expect(board.children[7].id).toBe(children[5].id);
        });

        it('both select partial element in different group', () => {
            addSelectedElement(board, [children[3], children[6]]);
            ZIndexTransforms.moveDown(board);
            expect(board.children[2].id).toBe(children[3].id);
            expect(board.children[5].id).toBe(children[6].id);
        });
    });
});
