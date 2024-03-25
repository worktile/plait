import { PlaitElement, PlaitBoard } from '../interfaces';
import { createTestingBoard } from '../testing';
import { canAddGroup, canRemoveGroup, getHighestSelectedElements } from './group';

const children: PlaitElement[] = [
    {
        id: 'HKiKS',
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
            [-878.8864992700442, -192.19932879823625],
            [-776.4559437144886, -125.67470758611506]
        ],
        strokeWidth: 2
    },
    {
        id: 'WYtyJ',
        type: 'geometry',
        shape: 'ellipse',
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
            [-634.347256747159, -188.71528517597852],
            [-561.2609246764521, -128.27494426688764]
        ],
        strokeWidth: 2
    }
];

const group1: PlaitElement[] = [
    {
        id: 'AeXEN',
        type: 'group'
    },
    {
        id: 'xAcFH',
        type: 'geometry',
        shape: 'ellipse',
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
            [-891.1773767952967, -169.7916583436908],
            [-803.5156028053977, -96.78029470732719]
        ],
        strokeWidth: 2,
        groupId: 'AeXEN'
    },
    {
        id: 'MAcze',
        type: 'geometry',
        shape: 'ellipse',
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
            [-682.1948982007575, -164.09405270971433],
            [-594.5331242108585, -91.0826890733507]
        ],
        strokeWidth: 2,
        groupId: 'AeXEN'
    },
    {
        id: 'xAcFH',
        type: 'geometry',
        shape: 'ellipse',
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
            [-891.1773767952967, -169.7916583436908],
            [-803.5156028053977, -96.78029470732719]
        ],
        strokeWidth: 2,
        groupId: 'AeXEN'
    },
    {
        id: 'MAcze',
        type: 'geometry',
        shape: 'ellipse',
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
            [-682.1948982007575, -164.09405270971433],
            [-594.5331242108585, -91.0826890733507]
        ],
        strokeWidth: 2,
        groupId: 'AeXEN'
    }
];

const group2: PlaitElement[] = [
    {
        id: 'ENAeX',
        type: 'group'
    },
    {
        id: 'fHxAC',
        type: 'geometry',
        shape: 'ellipse',
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
            [-891.1773767952967, -169.7916583436908],
            [-803.5156028053977, -96.78029470732719]
        ],
        strokeWidth: 2,
        groupId: 'ENAeX'
    },
    {
        id: 'zMAce',
        type: 'geometry',
        shape: 'ellipse',
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
            [-682.1948982007575, -164.09405270971433],
            [-594.5331242108585, -91.0826890733507]
        ],
        strokeWidth: 2,
        groupId: 'ENAeX'
    }
];

describe('group', () => {
    let board: PlaitBoard;
    beforeEach(() => {
        board = createTestingBoard([], []);
    });

    describe('getHighestSelectedElements', () => {
        it('should get correctly value', () => {
            const value1 = getHighestSelectedElements(board, children);
            expect(children).toEqual(value1);

            const value2 = getHighestSelectedElements(board, group1);
            expect(value2.length).toBe(1);
            expect(value2[0]).toEqual(group1[0]);

            const value3 = getHighestSelectedElements(board, [...group1, ...children, group2[1]]);
            expect(value3.length).toBe(4);
            expect(value3).toContain(group1[0]);
            expect(value3).toContain(children[0]);
            expect(value3).toContain(children[1]);
            expect(value3).toContain(group2[1]);
        });
    });

    describe('canAddGroup', () => {
        it('should get canAddGroup value to be true', () => {
            expect(canAddGroup(board, children)).toBe(true);
            expect(canAddGroup(board, [...group1, ...children])).toBe(true);
            expect(canAddGroup(board, [...group1, ...group2])).toBe(true);
            expect(canAddGroup(board, [...group1, ...group2, ...children])).toBe(true);
            expect(canAddGroup(board, [...group1, children[0]])).toBe(true);
            expect(canAddGroup(board, [...group1, ...group2, children[0]])).toBe(true);
        });

        it('should get canAddGroup value to be false', () => {
            expect(canAddGroup(board, group1)).toBe(false);
            expect(canAddGroup(board, [...group1, group2[1]])).toBe(false);
        });
    });

    describe('canRemoveGroup', () => {
        it('should get canRemoveGroup value to be true', () => {
            expect(canRemoveGroup(board, group1)).toBe(true);
            expect(canRemoveGroup(board, [...group1, ...group2])).toBe(true);
            expect(canRemoveGroup(board, [...group1, ...children])).toBe(true);
            expect(canRemoveGroup(board, [...group1, group2[1]])).toBe(true);
        });

        it('should get canRemoveGroup value to be false', () => {
            expect(canRemoveGroup(board, children)).toBe(false);
            expect(canRemoveGroup(board, [group1[1], group2[1]])).toBe(false);
            expect(canRemoveGroup(board, [...children, group1[1]])).toBe(false);
        });
    });
});
