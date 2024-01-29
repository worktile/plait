import { Point } from '@plait/core';
import { getIndexAndDeleteCountByKeyPoint } from './line-resize';

describe('getIndexAndDeleteCountByKeyPoint', () => {
    describe('both the startPoint and endPoint are not on the elbow line segment', () => {
        it('both the startPoint and endPoint is on the same line as the dataPoints', () => {
            /**
             * dataPoints
             * 0 🔴<------
             *   ｜
             *   ｜
             * 1 🔴------------>
             *
             *  nextKeyPoints
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
                [1, 1],
                [1, 2]
            ];
            const nextKeyPoints: Point[] = [
                [0, 5],
                [1, 5],
                [1, 7],
                [3, 7],
                [3, 8]
            ];
            const handleIndex = 1;
            const { index, deleteCount } = getIndexAndDeleteCountByKeyPoint(dataPoints, nextKeyPoints, handleIndex);
            expect(index).toBe(0);
            expect(deleteCount).toBe(2);
        });
        it('only the startPoint is on the same line as the dataPoints', () => {
            /**
             * dataPoints
             * 0 🔴<----
             *   ｜
             *   ｜
             * 1 🔴 ---------->
             *
             *  nextKeyPoints
             * 1 🟢<----🟢 0
             *   ｜
             *   ｜
             * 2 🟢-----handle------>🟢 3
             *                       ｜
             *                       ｜
             *                <------🟢 4
             */
            const dataPoints: Point[] = [
                [1, 1],
                [1, 2]
            ];
            const nextKeyPoints: Point[] = [
                [0, 5],
                [1, 5],
                [1, 7],
                [3, 7],
                [3, 8]
            ];
            const handleIndex = 2;
            const { index, deleteCount } = getIndexAndDeleteCountByKeyPoint(dataPoints, nextKeyPoints, handleIndex);
            expect(index).toBe(1);
            expect(deleteCount).toBe(1);
        });
        it('only the endPoint is on the same line as the dataPoints', () => {
            /**
             *                      dataPoints
             *              -------->🔴 0
             *                       ｜
             *                       ｜
             *                <------🔴 1
             *
             *  nextKeyPoints
             * 1 🟢<----🟢 0
             *   ｜
             *   ｜
             * 2 🟢-----handle------>🟢 3
             *                       ｜
             *                       ｜
             *                <------🟢 4
             */
            const dataPoints: Point[] = [
                [3, 1],
                [3, 2]
            ];
            const nextKeyPoints: Point[] = [
                [0, 5],
                [1, 5],
                [1, 7],
                [3, 7],
                [3, 8]
            ];
            const handleIndex = 2;
            const { index, deleteCount } = getIndexAndDeleteCountByKeyPoint(dataPoints, nextKeyPoints, handleIndex);
            expect(index).toBe(0);
            expect(deleteCount).toBe(1);
        });
    });
});

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
                    },
                    {
                        id: 'KdfHJ',
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
                            [831.640380859375, -253.598388671875],
                            [1433.0316772460938, -183.777587890625]
                        ],
                        strokeWidth: 2,
                        strokeColor: '#e03130'
                    }
                ];
            });
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
                ];
            });
        });
    });
    describe('three custom points', () => {});
    describe('four custom points', () => {});
});
