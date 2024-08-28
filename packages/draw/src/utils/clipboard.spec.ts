import { createTestingBoard, PlaitBoard, PlaitElement } from '@plait/core';
import { withDraw } from '@plait/draw';
import { insertClipboardData } from './clipboard';
import { PlaitDrawElement } from '../interfaces';

describe('draw-clipboard', () => {
    let board: PlaitBoard;
    beforeEach(() => {
        board = createTestingBoard([withDraw], []);
    });

    describe('insertClipboardData', () => {
        it('should insert data in order', () => {
            const data: PlaitElement[] = [
                {
                    id: 'TrbQN',
                    type: 'arrow-line',
                    shape: 'straight',
                    source: {
                        marker: 'none'
                    },
                    texts: [],
                    target: {
                        marker: 'arrow'
                    },
                    opacity: 1,
                    points: [
                        [632.9327119652326, 398.5482447148603],
                        [789.0883520038215, 188.84713821714888]
                    ],
                    strokeWidth: 2
                },
                {
                    id: 'MjDiz',
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
                        [603.4487452249368, 238.151190375571],
                        [791.4876167757138, 334.1265443036576]
                    ],
                    strokeWidth: 2,
                    fill: '#e48483',
                    strokeColor: '#1e1e1e'
                }
            ];
            const geometryId = data[0].id;
            const lineId = data[1].id;
            insertClipboardData(board, data as PlaitDrawElement[], [0, 0]);
            expect(board.children.length).toBe(2);
            expect(board.children[0].type).toBe('arrow-line');
            expect(board.children[1].type).toBe('geometry');
            expect(board.children[0].id).not.toEqual(geometryId);
            expect(board.children[1].id).not.toBe(lineId);
        });

        it('should correctly modify the ids of all elements', () => {
            const data = [
                {
                    id: 'rBTNk',
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
                        [482.6310937597948, 200.18242358724206],
                        [609.0771806344296, 265.57718356923044]
                    ],
                    strokeWidth: 2,
                    fill: '#e48483',
                    strokeColor: '#1e1e1e'
                },
                {
                    id: 'Xxsnf',
                    type: 'arrow-line',
                    shape: 'elbow',
                    source: {
                        marker: 'none',
                        connection: [0.5, 0],
                        boundId: 'rBTNk'
                    },
                    texts: [],
                    target: {
                        marker: 'arrow',
                        connection: [0.5, 0],
                        boundId: 'MJmar'
                    },
                    opacity: 1,
                    points: [
                        [545.8541371971122, 183.68242358724206],
                        [902.2971450290445, 208.2601530452988]
                    ],
                    strokeWidth: 2
                },
                {
                    id: 'MJmar',
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
                        [699.4515871200133, 144.3828510119847],
                        [825.8976739946481, 209.7776109939731]
                    ],
                    strokeWidth: 2,
                    fill: '#e48483',
                    strokeColor: '#1e1e1e'
                },
                {
                    id: 'xGQwC',
                    type: 'swimlane',
                    shape: 'swimlaneVertical',
                    points: [
                        [635.0266509041426, 341.92896501840625],
                        [1178.35269509016, 865.9289650184062]
                    ],
                    rows: [
                        {
                            id: 'QxReG',
                            height: 42
                        },
                        {
                            id: 'NQkNx'
                        }
                    ],
                    columns: [
                        {
                            id: 'BPrih',
                            width: 156.65937751935087
                        },
                        {
                            id: 'aPBxp'
                        },
                        {
                            id: 'CcmhC'
                        }
                    ],
                    header: false,
                    cells: [
                        {
                            id: 'sYCCy',
                            rowId: 'QxReG',
                            columnId: 'BPrih',
                            textHeight: 20,
                            text: {
                                children: [
                                    {
                                        text: 'New Swimlane'
                                    }
                                ],
                                align: 'center'
                            }
                        },
                        {
                            id: 'YCMms',
                            rowId: 'QxReG',
                            columnId: 'aPBxp',
                            textHeight: 20,
                            text: {
                                children: [
                                    {
                                        text: 'New Swimlane'
                                    }
                                ],
                                align: 'center'
                            }
                        },
                        {
                            id: 'czRtB',
                            rowId: 'QxReG',
                            columnId: 'CcmhC',
                            textHeight: 20,
                            text: {
                                children: [
                                    {
                                        text: 'New Swimlane'
                                    }
                                ],
                                align: 'center'
                            }
                        },
                        {
                            id: 'Jcnty',
                            rowId: 'NQkNx',
                            columnId: 'BPrih'
                        },
                        {
                            id: 'PwZbR',
                            rowId: 'NQkNx',
                            columnId: 'aPBxp'
                        },
                        {
                            id: 'YsEsH',
                            rowId: 'NQkNx',
                            columnId: 'CcmhC'
                        }
                    ]
                },
                {
                    id: 'kSwPa',
                    type: 'arrow-line',
                    shape: 'elbow',
                    source: {
                        marker: 'none',
                        connection: [0.5, 1],
                        boundId: 'rBTNk'
                    },
                    texts: [],
                    target: {
                        marker: 'arrow',
                        connection: [0, 0.4999999999999999],
                        boundId: 'xGQwC'
                    },
                    opacity: 1,
                    points: [
                        [545.8541371971122, 282.07718356923044],
                        [634.0329628308994, 599.2121031481448]
                    ],
                    strokeWidth: 2
                }
            ];

            const sourceGeometryId = data[0].id;
            const targetGeometryId = data[2].id;
            const targetSwimlaneId = data[3].id;
            insertClipboardData(board, data as PlaitDrawElement[], [0, 0]);
            expect(board.children.length).toBe(5);
            const newSourceGeometryId = board.children[0].id;
            const newTargetGeometryId = board.children[2].id;
            const newTargetSwimlaneIdId = board.children[3].id;
            expect(newSourceGeometryId).not.toEqual(sourceGeometryId);
            expect(newTargetGeometryId).not.toBe(targetGeometryId);
            expect(newTargetSwimlaneIdId).not.toBe(targetSwimlaneId);
            expect(board.children[1].source.boundId).toBe(newSourceGeometryId);
            expect(board.children[1].target.boundId).toBe(newTargetGeometryId);
            expect(board.children[4].source.boundId).toBe(newSourceGeometryId);
            expect(board.children[4].target.boundId).toBe(newTargetSwimlaneIdId);
        });
    });
});
