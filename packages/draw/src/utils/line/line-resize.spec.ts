import { PlaitBoard, PlaitElement, Point, createTestingBoard } from '@plait/core';
import { getIndexAndDeleteCountByKeyPoint, getMirrorDataPoints } from './line-resize';
import { PlaitGeometry, PlaitLine } from '../../interfaces';
import { getElbowLineRouteOptions, getLineHandleRefPair } from './line-common';
import { generateElbowLineRoute, removeDuplicatePoints, simplifyOrthogonalPoints } from '@plait/common';

describe('getIndexAndDeleteCountByKeyPoint', () => {
    let board: PlaitBoard;
    let resizeLine: PlaitLine;
    beforeEach(() => {
        board = createTestingBoard([], []);
    });
    /*
     * Annotations:
     * startPoint: the start point of the resize line in the nextRenderPoints
     * endPoint: the end point of the resize line in the nextRenderPoints
     * dataPoints: the points in the data
     * nextRenderPoints: the points actually rendered
     *
     *
     *
     * Graphic Annotations:
     * ---handle---: resize line
     * 🔴 : point in the dataPoints, only render points with index 1 and 2
     * 🟢 : point in the nextRenderPoints
     * 🟣 : coincident point of dataPoints and nextRenderPoints
     * 0/1/2...: index of dataPoints or nextRenderPoints. In dataPoints, there are only 1 and 2
     *
     */
    describe('the startPoint or endPoint is in the dataPoints', () => {
        it('both the startPoint and endPoint are in the dataPoints', () => {
            /**
             * dataPoints / nextRenderPoints
             *          2 🟣-------->🟢 3
             *            ｜
             *          handle
             *            ｜
             * 0 🟢------>🟣 1
             *
             */
            const dataPoints: Point[] = [
                [0, 1],
                [1, 5],
                [1, 8],
                [2, 10]
            ];
            const nextRenderPoints: Point[] = [
                [0, 5],
                [1, 5],
                [1, 8],
                [2, 8]
            ];
            const handleIndex = 1;
            const { index, deleteCount } = getIndexAndDeleteCountByKeyPoint(board, resizeLine, dataPoints, nextRenderPoints, handleIndex);
            expect(index).toBe(0);
            expect(deleteCount).toBe(2);
        });
        // move target
        describe('only the startPoint is in the dataPoints', () => {
            it('the startPoint and endPoint are align with relation points in dataPoints', () => {
                /**
                 * dataPoints / nextRenderPoints
                 *
                 *            2           3
                 *            🟢--------->🟢
                 *            ｜
                 *          handle
                 *            ｜
                 * 0 🟢------>🟣 1
                 *            ｜
                 *            ｜
                 *            🔴 2
                 *
                 */
                const dataPoints: Point[] = [
                    [0, 1],
                    [1, 5],
                    [1, 2],
                    [2, 10]
                ];
                const nextRenderPoints: Point[] = [
                    [0, 5],
                    [1, 5],
                    [1, 8],
                    [2, 8]
                ];
                const handleIndex = 1;
                const { index, deleteCount } = getIndexAndDeleteCountByKeyPoint(
                    board,
                    resizeLine,
                    dataPoints,
                    nextRenderPoints,
                    handleIndex
                );
                expect(index).toBe(0);
                expect(deleteCount).toBe(2);
            });
            it('the startPoint or endPoint is not align with relation points in dataPoints', () => {
                /**
                 * dataPoints / nextRenderPoints
                 *
                 *            2              3
                 *            🟢---handle--->🟢
                 *            ｜             ｜
                 *            ｜           4 🟢----->
                 * 0 🟢------>🟣 1
                 *            ｜
                 *            ｜
                 *            🔴 2
                 *
                 */
                const dataPoints: Point[] = [
                    [0, 1],
                    [1, 5],
                    [1, 2],
                    [2, 10]
                ];
                const nextRenderPoints: Point[] = [
                    [0, 5],
                    [1, 5],
                    [1, 8],
                    [2, 8],
                    [2, 6]
                ];
                const handleIndex = 2;
                const { index, deleteCount } = getIndexAndDeleteCountByKeyPoint(
                    board,
                    resizeLine,
                    dataPoints,
                    nextRenderPoints,
                    handleIndex
                );
                expect(index).toBe(1);
                expect(deleteCount).toBe(1);
            });
        });

        // move source
        describe('only the endPoint is in the dataPoints', () => {
            it('the startPoint and endPoint are align with relation points in dataPoints', () => {
                /**
                 * dataPoints / nextRenderPoints
                 *
                 *            2           3
                 *            🟣--------->🟢
                 *            ｜
                 *          handle
                 *            ｜
                 * 0 🟢------>🟢 1
                 *            ｜
                 *            ｜
                 *            🔴 1
                 *
                 */
                const dataPoints: Point[] = [
                    [0, 1],
                    [1, 2],
                    [1, 8],
                    [2, 10]
                ];
                const nextRenderPoints: Point[] = [
                    [0, 5],
                    [1, 5],
                    [1, 8],
                    [2, 8]
                ];
                const handleIndex = 1;
                const { index, deleteCount } = getIndexAndDeleteCountByKeyPoint(
                    board,
                    resizeLine,
                    dataPoints,
                    nextRenderPoints,
                    handleIndex
                );
                expect(index).toBe(0);
                expect(deleteCount).toBe(2);
            });
            it('the startPoint or endPoint is not align with relation points in dataPoints', () => {
                /**
                 * dataPoints / nextRenderPoints
                 *
                 *            2                3
                 *            🟣----handle---->🟢
                 *            ｜               ｜
                 *            ｜             4 🟢--->
                 * 0 🟢------>🟢 1
                 *            ｜
                 *            ｜
                 *            🔴 1
                 *
                 */
                const dataPoints: Point[] = [
                    [0, 1],
                    [1, 2],
                    [1, 6],
                    [2, 10]
                ];
                const nextRenderPoints: Point[] = [
                    [0, 5],
                    [1, 5],
                    [1, 8],
                    [2, 8],
                    [2, 6]
                ];
                const handleIndex = 2;
                const { index, deleteCount } = getIndexAndDeleteCountByKeyPoint(
                    board,
                    resizeLine,
                    dataPoints,
                    nextRenderPoints,
                    handleIndex
                );
                expect(index).toBe(1);
                expect(deleteCount).toBe(1);
            });
        });
    });

    // move source and target
    describe('the startPoint and endPoint are not in the dataPoints', () => {
        describe('there are relation points on dataPoints with the startPoint and endPoint', () => {
            it('both the startPoint and endPoint are align with relation points in dataPoints', () => {
                /**
                 * dataPoints
                 * 1 🔴<------
                 *   ｜
                 *   ｜
                 * 2 🔴------------>
                 *
                 *  nextRenderPoints
                 * 1 🟢<----🟢 0
                 *   ｜
                 * handle
                 *   ｜
                 * 2 🟢----------------->🟢 3
                 *                       ｜
                 *                       ｜
                 *                <------🟢 4
                 */
                const dataPoints: Point[] = [
                    [0, 1],
                    [1, 1],
                    [1, 2],
                    [3, 5]
                ];
                const nextRenderPoints: Point[] = [
                    [0, 5],
                    [1, 5],
                    [1, 7],
                    [3, 7],
                    [3, 8]
                ];
                const handleIndex = 1;
                const { index, deleteCount } = getIndexAndDeleteCountByKeyPoint(
                    board,
                    resizeLine,
                    dataPoints,
                    nextRenderPoints,
                    handleIndex
                );
                expect(index).toBe(0);
                expect(deleteCount).toBe(2);
            });
            it('only the startPoint is align with relation points in dataPoints', () => {
                /**
                 * dataPoints
                 * 1 🔴<----
                 *   ｜
                 *   ｜
                 * 2 🔴 ---------->
                 *
                 *  nextRenderPoints
                 * 1 🟢<----🟢 0
                 *   ｜
                 *   ｜
                 * 2 🟢-----handle------>🟢 3
                 *                       ｜
                 *                       ｜
                 *                <------🟢 4
                 */
                const dataPoints: Point[] = [
                    [0, 1],
                    [1, 1],
                    [1, 2],
                    [3, 5]
                ];
                const nextRenderPoints: Point[] = [
                    [0, 5],
                    [1, 5],
                    [1, 7],
                    [3, 7],
                    [3, 8]
                ];
                const handleIndex = 2;
                const { index, deleteCount } = getIndexAndDeleteCountByKeyPoint(
                    board,
                    resizeLine,
                    dataPoints,
                    nextRenderPoints,
                    handleIndex
                );
                expect(index).toBe(1);
                expect(deleteCount).toBe(1);
            });
            it('only the endPoint is align with relation points in dataPoints', () => {
                /**
                 *                      dataPoints
                 *              -------->🔴 1
                 *                       ｜
                 *                       ｜
                 *                <------🔴 2
                 *
                 *  nextRenderPoints
                 * 1 🟢<----🟢 0
                 *   ｜
                 *   ｜
                 * 2 🟢-----handle------>🟢 3
                 *                       ｜
                 *                       ｜
                 *                <------🟢 4
                 */
                const dataPoints: Point[] = [
                    [0, 1],
                    [3, 1],
                    [3, 2],
                    [3, 5]
                ];
                const nextRenderPoints: Point[] = [
                    [0, 5],
                    [1, 5],
                    [1, 7],
                    [3, 7],
                    [3, 8]
                ];
                const handleIndex = 2;
                const { index, deleteCount } = getIndexAndDeleteCountByKeyPoint(
                    board,
                    resizeLine,
                    dataPoints,
                    nextRenderPoints,
                    handleIndex
                );
                expect(index).toBe(0);
                expect(deleteCount).toBe(1);
            });
        });

        describe('there are not relation points on dataPoints with the startPoint and endPoint', () => {
            it('custom resize points not exist', () => {
                /**
                 *  dataPoints
                 *
                 *
                 *  nextRenderPoints
                 * 1 🟢<----🟢 0
                 *   ｜
                 * handle
                 *   ｜
                 * 2 🟢----------->🟢 3
                 *
                 */
                const dataPoints: Point[] = [
                    [0, 1],
                    [3, 5]
                ];
                const nextRenderPoints: Point[] = [
                    [0, 5],
                    [1, 5],
                    [1, 7],
                    [3, 7]
                ];
                const handleIndex = 1;
                const { index, deleteCount } = getIndexAndDeleteCountByKeyPoint(
                    board,
                    resizeLine,
                    dataPoints,
                    nextRenderPoints,
                    handleIndex
                );
                expect(index).toBe(0);
                expect(deleteCount).toBe(0);
            });
            describe('custom resize points exist', () => {
                it('in dataPoints, the relation points for the previous point can be found.', () => {});
                describe('in dataPoints, the relation points for the previous point can not be found.', () => {
                    it('nextRenderPoints is a straight line', () => {});
                    it('nextRenderPoints is not a straight line', () => {});
                });
            });
        });
    });
});

/*
 * Graphic Annotations:
 * 🟠 : point in the nextDataPoints
 * 🟢 : point in the nextKeyPoints
 * 🟣 : coincident point of dataPoints and nextKeyPoints
 * 0/1/2...: index of nextDataPoints or nextKeyPoints.
 */
describe('getMirrorDataPoints', () => {
    describe('two custom points', () => {
        it('first custom point exist get mid points', () => {
            const data = [
                {
                    id: 'cfKPC',
                    type: 'geometry',
                    shape: 'rectangle',
                    angle: 0,
                    opacity: 1,
                    textHeight: 20,
                    text: {
                        children: [
                            {
                                text: '1'
                            }
                        ],
                        align: 'center'
                    },
                    points: [
                        [602.751953125, -460.291015625],
                        [887.994140625, -309.982421875]
                    ],
                    strokeWidth: 2
                },
                {
                    id: 'PjDEn',
                    type: 'geometry',
                    shape: 'rectangle',
                    angle: 0,
                    opacity: 1,
                    textHeight: 20,
                    text: {
                        children: [
                            {
                                text: '2'
                            }
                        ],
                        align: 'center'
                    },
                    points: [
                        [1235.2843017578125, -401.513427734375],
                        [1520.5264892578125, -251.204833984375]
                    ],
                    strokeWidth: 2
                },
                {
                    id: 'wxJsD',
                    type: 'line',
                    shape: 'elbow',
                    source: {
                        marker: 'none',
                        connection: [1, 0.5],
                        boundId: 'cfKPC'
                    },
                    texts: [],
                    target: {
                        marker: 'arrow',
                        connection: [0, 0.5],
                        boundId: 'PjDEn'
                    },
                    opacity: 1,
                    points: [
                        [903.994140625, -385.13671875],
                        [1237.8208618164062, -376.5731201171875]
                    ],
                    strokeWidth: 2,
                    strokeColor: '#e03130'
                },
                {
                    id: 'fxZDF',
                    type: 'line',
                    shape: 'elbow',
                    source: {
                        marker: 'none',
                        connection: [1, 0.5],
                        boundId: 'cfKPC'
                    },
                    texts: [],
                    target: {
                        marker: 'arrow',
                        connection: [0, 0.5],
                        boundId: 'PjDEn'
                    },
                    opacity: 1,
                    points: [
                        [887.994140625, -385.13671875],
                        [1061.6392211914062, -268.562255859375],
                        [1203.2843017578125, -268.562255859375],
                        [1233.2843017578125, -326.359130859375]
                    ],
                    strokeWidth: 2
                }
            ];
        });
        it('first custom point exist mirror point', () => {});
        it('second custom point exist mirror point', () => {});
        it('two custom points exist mirror points', () => {
            const data = [
                {
                    id: 'cfKPC',
                    type: 'geometry',
                    shape: 'rectangle',
                    angle: 0,
                    opacity: 1,
                    textHeight: 20,
                    text: {
                        children: [
                            {
                                text: '1'
                            }
                        ],
                        align: 'center'
                    },
                    points: [
                        [632.80078125, -498.197265625],
                        [918.04296875, -347.888671875]
                    ],
                    strokeWidth: 2
                },
                {
                    id: 'PjDEn',
                    type: 'geometry',
                    shape: 'rectangle',
                    angle: 0,
                    opacity: 1,
                    textHeight: 20,
                    text: {
                        children: [
                            {
                                text: '2'
                            }
                        ],
                        align: 'center'
                    },
                    points: [
                        [1216.4971923828125, -378.771240234375],
                        [1501.7393798828125, -228.462646484375]
                    ],
                    strokeWidth: 2
                },
                {
                    id: 'wxJsD',
                    type: 'line',
                    shape: 'elbow',
                    source: {
                        marker: 'none',
                        connection: [1, 0.5],
                        boundId: 'cfKPC'
                    },
                    texts: [],
                    target: {
                        marker: 'arrow',
                        connection: [0, 0.5],
                        boundId: 'PjDEn'
                    },
                    opacity: 1,
                    points: [
                        [903.994140625, -385.13671875],
                        [1237.8208618164062, -376.5731201171875]
                    ],
                    strokeWidth: 2,
                    strokeColor: '#e03130'
                },
                {
                    id: 'iMrYD',
                    type: 'line',
                    shape: 'elbow',
                    source: {
                        marker: 'none',
                        connection: [1, 0.5],
                        boundId: 'cfKPC'
                    },
                    texts: [],
                    target: {
                        marker: 'arrow',
                        connection: [0, 0.5],
                        boundId: 'PjDEn'
                    },
                    opacity: 1,
                    points: [
                        [887.994140625, -385.13671875],
                        [996.9478149414062, -385.13671875],
                        [996.9478149414062, -326.359130859375],
                        [1233.2843017578125, -326.359130859375]
                    ],
                    strokeWidth: 2
                }
            ];
        });
        it('can not get mirror points by parallel segment', () => {
            const data = [
                {
                    id: 'cfKPC',
                    type: 'geometry',
                    shape: 'rectangle',
                    angle: 0,
                    opacity: 1,
                    textHeight: 20,
                    text: {
                        children: [
                            {
                                text: '1'
                            }
                        ],
                        align: 'center'
                    },
                    points: [
                        [694.714599609375, -220.592529296875],
                        [979.956787109375, -70.283935546875]
                    ],
                    strokeWidth: 2
                },
                {
                    id: 'PjDEn',
                    type: 'geometry',
                    shape: 'rectangle',
                    angle: 0,
                    opacity: 1,
                    textHeight: 20,
                    text: {
                        children: [
                            {
                                text: '2'
                            }
                        ],
                        align: 'center'
                    },
                    points: [
                        [996.2530517578125, -11.308349609375],
                        [1281.4952392578125, 139.000244140625]
                    ],
                    strokeWidth: 2
                },
                {
                    id: 'WQyZs',
                    type: 'line',
                    shape: 'elbow',
                    source: {
                        marker: 'none',
                        connection: [1, 0.5],
                        boundId: 'cfKPC'
                    },
                    texts: [],
                    target: {
                        marker: 'arrow',
                        connection: [0, 0.5],
                        boundId: 'PjDEn'
                    },
                    opacity: 1,
                    points: [
                        [989.874755859375, -157.346435546875],
                        [1225.8949584960938, -98.471923828125]
                    ],
                    strokeWidth: 2,
                    strokeColor: '#e03130'
                },
                {
                    id: 'PhJhw',
                    type: 'line',
                    shape: 'elbow',
                    source: {
                        marker: 'none',
                        connection: [1, 0.5],
                        boundId: 'cfKPC'
                    },
                    texts: [],
                    target: {
                        marker: 'arrow',
                        connection: [0, 0.5],
                        boundId: 'PjDEn'
                    },
                    opacity: 1,
                    points: [
                        [973.874755859375, -157.346435546875],
                        [1050.6166381835938, -157.346435546875],
                        [1050.6166381835938, -23.372802734375],
                        [1230.8897705078125, -23.372802734375]
                    ],
                    strokeWidth: 2
                }
            ];
        });
        /**
         *
         *  nextKeyPoints/nextDataPoints
         * 0 🟢----------------->🟢 1
         *                       ｜
         *                       ｜
         *                       ｜
         *              1 🟠    2 🟢----------->🟢 3
         *                 |
         *                 |
         *                 |
         *              2 🟠
         */
        it('first custom point(as the endPoint parameter when calling getMidKeyPoints) align the point of keyPoints', () => {
            const case1 = [
                {
                    id: 'yDcPf',
                    type: 'geometry',
                    shape: 'rectangle',
                    angle: 0,
                    opacity: 1,
                    textHeight: 20,
                    text: {
                        children: [
                            {
                                text: '1'
                            }
                        ],
                        align: 'center'
                    },
                    points: [
                        [613.2762451171875, -316.4130859375],
                        [717.3426513671875, -186.4482421875]
                    ],
                    strokeWidth: 2
                },
                {
                    id: 'bmssB',
                    type: 'geometry',
                    shape: 'rectangle',
                    angle: 0,
                    opacity: 1,
                    textHeight: 20,
                    text: {
                        children: [
                            {
                                text: '2'
                            }
                        ],
                        align: 'center'
                    },
                    points: [
                        [1054.4017333984375, -213.5341796875],
                        [1158.4681396484375, -83.5693359375]
                    ],
                    strokeWidth: 2
                },
                {
                    id: 'PWReA',
                    type: 'line',
                    shape: 'elbow',
                    source: {
                        marker: 'none',
                        connection: [1, 0.5],
                        boundId: 'yDcPf'
                    },
                    texts: [],
                    target: {
                        marker: 'arrow',
                        connection: [0, 0.5],
                        boundId: 'bmssB'
                    },
                    opacity: 1,
                    points: [
                        [717.3426513671875, -251.4306640625],
                        [829.2276611328125, -148.5517578125],
                        [829.2276611328125, -45.0498046875],
                        [1054.4017333984375, -148.5517578125]
                    ],
                    strokeWidth: 2
                }
            ] as [PlaitGeometry, PlaitGeometry, PlaitLine];
            const correctMirrorDataPointsOfCase1 = [
                [749.3426513671875, -251.4306640625],
                [829.2276611328125, -251.4306640625],
                [829.2276611328125, -148.5517578125],
                [1022.4017333984375, -148.5517578125]
            ] as Point[];
            verifyGetMirrorDataPointsMethod(case1, correctMirrorDataPointsOfCase1);
            // opposite of case1
            const case2 = [
                {
                    id: 'ErBNz',
                    type: 'geometry',
                    shape: 'rectangle',
                    angle: 0,
                    opacity: 1,
                    textHeight: 20,
                    text: {
                        children: [
                            {
                                text: '1'
                            }
                        ],
                        align: 'center'
                    },
                    points: [
                        [1113.57470703125, 145.6826171875],
                        [1217.64111328125, 275.6474609375]
                    ],
                    strokeWidth: 2
                },
                {
                    id: 'EspJZ',
                    type: 'geometry',
                    shape: 'rectangle',
                    angle: 0,
                    opacity: 1,
                    textHeight: 20,
                    text: {
                        children: [
                            {
                                text: '2'
                            }
                        ],
                        align: 'center'
                    },
                    points: [
                        [555, 35.8349609375],
                        [659.06640625, 165.7998046875]
                    ],
                    strokeWidth: 2
                },
                {
                    id: 'RCHsH',
                    type: 'line',
                    shape: 'elbow',
                    source: {
                        marker: 'none',
                        connection: [0, 0.5],
                        boundId: 'ErBNz'
                    },
                    texts: [],
                    target: {
                        marker: 'arrow',
                        connection: [1, 0.5],
                        boundId: 'EspJZ'
                    },
                    opacity: 1,
                    points: [
                        [1113.57470703125, 210.6650390625],
                        [811.662353515625, 100.8173828125],
                        [811.662353515625, 208.2861328125],
                        [659.06640625, 100.8173828125]
                    ],
                    strokeWidth: 2
                }
            ] as [PlaitGeometry, PlaitGeometry, PlaitLine];
            const correctMirrorDataPointsOfCase2 = [
                [1081.57470703125, 210.6650390625],
                [811.662353515625, 210.6650390625],
                [811.662353515625, 100.8173828125],
                [691.06640625, 100.8173828125]
            ] as Point[];
            verifyGetMirrorDataPointsMethod(case2, correctMirrorDataPointsOfCase2);
            const case3 = [
                {
                    id: 'NsZDk',
                    type: 'geometry',
                    shape: 'rectangle',
                    angle: 0,
                    opacity: 1,
                    textHeight: 20,
                    text: {
                        children: [
                            {
                                text: '1'
                            }
                        ],
                        align: 'center'
                    },
                    points: [
                        [1355.9581298828125, -291.78515625],
                        [1425.8292236328125, -201.234375]
                    ],
                    strokeWidth: 2
                },
                {
                    id: 'ZhfWz',
                    type: 'geometry',
                    shape: 'rectangle',
                    angle: 0,
                    opacity: 1,
                    textHeight: 20,
                    text: {
                        children: [
                            {
                                text: '2'
                            }
                        ],
                        align: 'center'
                    },
                    points: [
                        [1647.0089111328125, -282.833984375],
                        [1716.8800048828125, -192.283203125]
                    ],
                    strokeWidth: 2
                },
                {
                    id: 'WNkHc',
                    type: 'line',
                    shape: 'elbow',
                    source: {
                        marker: 'none',
                        connection: [0, 0.5],
                        boundId: 'NsZDk'
                    },
                    texts: [],
                    target: {
                        marker: 'arrow',
                        connection: [0, 0.5],
                        boundId: 'ZhfWz'
                    },
                    opacity: 1,
                    points: [
                        [1344.0948486328125, -237.55859375],
                        [1256.4464111328125, -237.55859375],
                        [1256.4464111328125, -314.833984375],
                        [1645.0089111328125, -253.96875]
                    ],
                    strokeWidth: 2
                }
            ] as [PlaitGeometry, PlaitGeometry, PlaitLine];
            const correctMirrorDataPointsOfCase3 = [
                [
                    1323.9581298828125,
                    -246.509765625
                ],
                [
                    1256.4464111328125,
                    -246.509765625
                ],
                [
                    1256.4464111328125,
                    -169.234375
                ],
                [
                    1615.0089111328125,
                    -237.55859375
                ]
            ] as Point[];
            verifyGetMirrorDataPointsMethod(case3, correctMirrorDataPointsOfCase3);
        });
        describe('exist multiple parallel segments', () => {
            it('parallel is out of boundary of rectangle of source and target', () => {
                const data = [
                    {
                        id: 'cfKPC',
                        type: 'geometry',
                        shape: 'rectangle',
                        angle: 0,
                        opacity: 1,
                        textHeight: 20,
                        text: {
                            children: [
                                {
                                    text: '1'
                                }
                            ],
                            align: 'center'
                        },
                        points: [
                            [688.632568359375, -232.500732421875],
                            [973.874755859375, -82.192138671875]
                        ],
                        strokeWidth: 2
                    },
                    {
                        id: 'PjDEn',
                        type: 'geometry',
                        shape: 'rectangle',
                        angle: 0,
                        opacity: 1,
                        textHeight: 20,
                        text: {
                            children: [
                                {
                                    text: '2'
                                }
                            ],
                            align: 'center'
                        },
                        points: [
                            [1175.0128173828125, -248.021240234375],
                            [1460.2550048828125, -97.712646484375]
                        ],
                        strokeWidth: 2
                    },
                    {
                        id: 'kphNw',
                        type: 'line',
                        shape: 'elbow',
                        source: {
                            marker: 'none',
                            connection: [0.5, 0],
                            boundId: 'cfKPC'
                        },
                        texts: [],
                        target: {
                            marker: 'arrow',
                            connection: [1, 0.5],
                            boundId: 'PjDEn'
                        },
                        opacity: 1,
                        points: [
                            [831.640380859375, -237.598388671875],
                            [1603.8018798828125, -269.598388671875],
                            [1603.8018798828125, -96.070068359375],
                            [1457.6300048828125, -96.070068359375]
                        ],
                        strokeWidth: 2
                    }
                ] as [PlaitGeometry, PlaitGeometry, PlaitLine];
                const expectedMirrorDataPoints = [
                    [
                        831.253662109375,
                        -264.500732421875
                    ],
                    [
                        1603.8018798828125,
                        -264.500732421875
                    ],
                    [
                        1603.8018798828125,
                        -172.866943359375
                    ],
                    [
                        1492.2550048828125,
                        -172.866943359375
                    ]
                ] as Point[];
                verifyGetMirrorDataPointsMethod(data, expectedMirrorDataPoints);
            });
            /**
             *
             *  nextKeyPoints/nextDataPoints
             * 0 🟢---------->🟢 1
             *                ｜
             *                ｜
             *                ｜
             *              2 🟢---------->🟢 3
             * 
             *          1 🟠       2 🟠
             *            
             */
            it('parallel between source rectangle and target rectangle', () => {
                const data = [
                    {
                        id: 'cfKPC',
                        type: 'geometry',
                        shape: 'rectangle',
                        angle: 0,
                        opacity: 1,
                        textHeight: 20,
                        text: {
                            children: [
                                {
                                    text: '1'
                                }
                            ],
                            align: 'center'
                        },
                        points: [
                            [688.632568359375, -232.500732421875],
                            [973.874755859375, -82.192138671875]
                        ],
                        strokeWidth: 2
                    },
                    {
                        id: 'PjDEn',
                        type: 'geometry',
                        shape: 'rectangle',
                        angle: 0,
                        opacity: 1,
                        textHeight: 20,
                        text: {
                            children: [
                                {
                                    text: '2'
                                }
                            ],
                            align: 'center'
                        },
                        points: [
                            [1195.3389892578125, -175.243896484375],
                            [1480.5811767578125, -24.935302734375]
                        ],
                        strokeWidth: 2
                    },
                    {
                        id: 'SFwRY',
                        type: 'line',
                        shape: 'elbow',
                        source: {
                            marker: 'none',
                            connection: [1, 0.5],
                            boundId: 'cfKPC'
                        },
                        texts: [],
                        target: {
                            marker: 'arrow',
                            connection: [0, 0.5],
                            boundId: 'PjDEn'
                        },
                        opacity: 1,
                        points: [
                            [973.874755859375, -157.346435546875],
                            [1090.0512084960938, -69.628662109375],
                            [1174.2276611328125, -69.628662109375],
                            [1204.2276611328125, -101.870849609375]
                        ],
                        strokeWidth: 2,
                        strokeColor: '#1e1e1e'
                    }
                ] as [PlaitGeometry, PlaitGeometry, PlaitLine];
                const expectedMirrorDataPoints = [
                    [
                        1005.874755859375,
                        -157.346435546875
                    ],
                    [
                        1005.874755859375,
                        -69.628662109375
                    ],
                    [
                        1163.3389892578125,
                        -69.628662109375
                    ],
                    [
                        1163.3389892578125,
                        -100.089599609375
                    ]
                ] as Point[];
                verifyGetMirrorDataPointsMethod(data, expectedMirrorDataPoints);
            });
        });
    });
    describe('three custom points', () => {});
    describe('four custom points', () => {});
    describe('five custom points', () => {
        describe('third point and fourth point is not straight line', () => {
            it('exist parallel line by second point and third point', () => {
                const data = [
                    {
                        id: 'ZQbWf',
                        type: 'geometry',
                        shape: 'terminal',
                        angle: 0,
                        opacity: 1,
                        textHeight: 20,
                        text: {
                            children: [
                                {
                                    text: 'source'
                                }
                            ],
                            align: 'center'
                        },
                        points: [
                            [938.359375, -68],
                            [1058.359375, 125.10546875]
                        ],
                        strokeWidth: 2
                    },
                    {
                        id: 'HXiap',
                        type: 'geometry',
                        shape: 'terminal',
                        angle: 0,
                        opacity: 1,
                        textHeight: 20,
                        text: {
                            children: [
                                {
                                    text: 'target'
                                }
                            ],
                            align: 'center'
                        },
                        points: [
                            [519.23828125, 64.8525390625],
                            [639.23828125, 261.5986328125]
                        ],
                        strokeWidth: 2
                    },
                    {
                        id: 'KBHJP',
                        type: 'line',
                        shape: 'elbow',
                        source: {
                            marker: 'none',
                            connection: [0, 0.5],
                            boundId: 'HXiap'
                        },
                        texts: [],
                        target: {
                            marker: 'arrow',
                            connection: [1, 0.5],
                            boundId: 'ZQbWf'
                        },
                        opacity: 1,
                        points: [
                            [519.23828125, 163.2255859375],
                            [378, 94.0673828125],
                            [378, -67.1689453125],
                            [752.5390625, -67.1689453125],
                            [1104.1015625, 89.3095703125],
                            [1104.1015625, -39.2431640625],
                            [1058.359375, 28.552734375]
                        ],
                        strokeWidth: 2
                    }
                ];
            });
            it('no exist parallel line by second point and third point', () => {
                const data = [
                    {
                        id: 'JSXfT',
                        type: 'geometry',
                        shape: 'process',
                        angle: 0,
                        opacity: 1,
                        textHeight: 20,
                        text: {
                            children: [
                                {
                                    text: '过程'
                                }
                            ],
                            align: 'center'
                        },
                        points: [
                            [1139.220703125, -79],
                            [1259.220703125, 114.10546875]
                        ],
                        strokeWidth: 2
                    },
                    {
                        id: 'WzYnE',
                        type: 'geometry',
                        shape: 'terminal',
                        angle: 0,
                        opacity: 1,
                        textHeight: 20,
                        text: {
                            children: [
                                {
                                    text: '开始'
                                }
                            ],
                            align: 'center'
                        },
                        points: [
                            [722.3359375, 171.2705078125],
                            [842.3359375, 368.0166015625]
                        ],
                        strokeWidth: 2
                    },
                    {
                        id: 'XspQR',
                        type: 'line',
                        shape: 'elbow',
                        source: {
                            marker: 'none',
                            connection: [0, 0.5],
                            boundId: 'WzYnE'
                        },
                        texts: [],
                        target: {
                            marker: 'arrow',
                            connection: [1, 0.5],
                            boundId: 'JSXfT'
                        },
                        opacity: 1,
                        points: [
                            [722.3359375, 269.6435546875],
                            [582, 150.6025390625],
                            [582, -10.6337890625],
                            [956.5390625, -10.6337890625],
                            [1308.1015625, 145.8447265625],
                            [1308.1015625, 17.2919921875],
                            [1259.220703125, 17.552734375]
                        ],
                        strokeWidth: 2
                    }
                ];
            });
        });
    });
});

function fakeGetMirrorDataPointsArguments(data: PlaitElement[], line: PlaitLine) {
    const board = createTestingBoard([], data);
    const handleRefPair = getLineHandleRefPair(board, line);
    const params = getElbowLineRouteOptions(board, line, handleRefPair);
    const keyPoints = removeDuplicatePoints(generateElbowLineRoute(params));
    const nextKeyPoints = keyPoints.slice(1, keyPoints.length - 1);
    const simplifiedNextKeyPoints = simplifyOrthogonalPoints(nextKeyPoints);
    const dataPoints = removeDuplicatePoints(PlaitLine.getPoints(board, line));
    const midDataPoints = dataPoints.slice(1, -1);
    const nextDataPoints = [simplifiedNextKeyPoints[0], ...midDataPoints, simplifiedNextKeyPoints[simplifiedNextKeyPoints.length - 1]];
    return { board, nextDataPoints, nextKeyPoints: simplifiedNextKeyPoints, params };
}

function verifyMirrorDataPoints(except: Point[], actual: Point[]) {
    except.forEach((e, index) => {
        expect(Point.isEquals(e, actual[index])).toEqual(true);
    });
}

function verifyGetMirrorDataPointsMethod(caseData: [PlaitGeometry, PlaitGeometry, PlaitLine], expectedMirrorDataPoints: Point[]) {
    const argumentsOfCase = fakeGetMirrorDataPointsArguments(caseData, caseData[2] as PlaitLine);
    const mirrorDataPointsOfCase = getMirrorDataPoints(
        argumentsOfCase.board,
        argumentsOfCase.nextDataPoints,
        argumentsOfCase.nextKeyPoints,
        argumentsOfCase.params
    );
    verifyMirrorDataPoints(expectedMirrorDataPoints, mirrorDataPointsOfCase);
}
