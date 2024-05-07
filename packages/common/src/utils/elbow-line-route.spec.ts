import { PlaitElement, Point, RectangleClient } from '@plait/core';
import { ElbowLineRouteOptions, generateElbowLineRoute } from './elbow-line-route';

describe('generate elbow line route', () => {
    describe('exception cases', () => {
        it('When the difference in y value between the center line (centerY) between source and target and the horizontal line of the shortest path is less than 1', () => {
            const elements = [
                {
                    id: 'iEcSZ',
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
                        [7111.365234375, -292.26123046875],
                        [7220.287109375, -204.61279296875]
                    ],
                    strokeWidth: 2
                },
                {
                    id: 'jArZJ',
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
                        [7394.78515625, -139.02099609375],
                        [7503.70703125, -51.37255859375]
                    ],
                    strokeWidth: 2
                },
                {
                    id: 'spRZM',
                    type: 'line',
                    shape: 'elbow',
                    source: {
                        marker: 'none',
                        connection: [0, 0.5],
                        boundId: 'iEcSZ'
                    },
                    texts: [],
                    target: {
                        marker: 'arrow',
                        connection: [1, 0.5],
                        boundId: 'jArZJ'
                    },
                    opacity: 1,
                    points: [
                        [7022.46875, -260.82763671875],
                        [7599.25, -178.01220703125],
                        [7599.25, -95.19677734375],
                        [7503.08984375, -96.89404296875]
                    ],
                    strokeWidth: 2
                }
            ];
            // build by elements through getElbowLineRouteOptions method
            const options: ElbowLineRouteOptions = {
                sourcePoint: [7111.365234375, -248.43701171875],
                nextSourcePoint: [7079.365234375, -248.43701171875],
                sourceRectangle: {
                    x: 7109.365234375,
                    y: -294.26123046875,
                    width: 112.921875,
                    height: 91.6484375
                },
                sourceOuterRectangle: {
                    x: 7079.365234375,
                    y: -324.26123046875,
                    width: 172.921875,
                    height: 151.6484375
                },
                targetPoint: [7505.70703125, -95.19677734375],
                nextTargetPoint: [7535.70703125, -95.19677734375],
                targetRectangle: {
                    x: 7392.78515625,
                    y: -141.02099609375,
                    width: 112.921875,
                    height: 91.6484375
                },
                targetOuterRectangle: {
                    x: 7362.78515625,
                    y: -171.02099609375,
                    width: 172.921875,
                    height: 151.6484375
                }
            };
            const route = generateElbowLineRoute(options);
            verifyOrthogonalPoints(route);
        });
        it('The calculation of the number of inflection points is abnormal, causing the centerline correction to fail.', () => {
            const elements = [
                {
                    id: 'iEcSZ',
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
                        [6969.2275390625, -355.5415588876942],
                        [7103.027912782662, -261.1848421117797]
                    ],
                    strokeWidth: 2
                },
                {
                    id: 'jArZJ',
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
                        [7288.517009092338, -355.5415588876941],
                        [7422.3173828125, -261.1848421117797]
                    ],
                    strokeWidth: 2
                },
                {
                    id: 'CXFrs',
                    type: 'line',
                    shape: 'elbow',
                    source: {
                        marker: 'none',
                        connection: [0.5, 0],
                        boundId: 'iEcSZ'
                    },
                    texts: [],
                    target: {
                        marker: 'arrow',
                        connection: [0, 0.5],
                        boundId: 'jArZJ'
                    },
                    opacity: 1,
                    points: [
                        [7279.877707419132, -291.823020614771],
                        [7464.375654066191, -476.36040830452293]
                    ],
                    strokeWidth: 2
                }
            ];
            const options: ElbowLineRouteOptions = {
                sourcePoint: [7036.127725922581, -355.5415588876942],
                nextSourcePoint: [7036.127725922581, -387.5415588876942],
                sourceRectangle: {
                    x: 6967.2275390625,
                    y: -357.5415588876942,
                    width: 137.8003737201616,
                    height: 98.35671677591449
                },
                sourceOuterRectangle: {
                    x: 6937.2275390625,
                    y: -387.5415588876942,
                    width: 197.8003737201616,
                    height: 158.3567167759145
                },
                targetPoint: [7286.517009092338, -308.3632004997369],
                nextTargetPoint: [7256.517009092338, -308.3632004997369],
                targetRectangle: {
                    x: 7286.517009092338,
                    y: -357.5415588876941,
                    width: 137.8003737201616,
                    height: 98.35671677591444
                },
                targetOuterRectangle: {
                    x: 7256.517009092338,
                    y: -387.5415588876941,
                    width: 197.8003737201616,
                    height: 158.35671677591444
                }
            };
            const isHorizontal = true;
            const centerX = RectangleClient.getGapCenter(options.sourceOuterRectangle, options.targetOuterRectangle, isHorizontal);
            const route = generateElbowLineRoute(options);
            verifyOrthogonalPoints(route);
            verifyOrthogonalPointsPassThroughCenterXOrCenterY(route, centerX, isHorizontal);
        });
        it('Obtain the incorrect corner points in the processing of adjust by centerX', () => {
            // can not obtain the incorrect data
            const elements = [
                {
                    id: 'GMKAE',
                    type: 'geometry',
                    shape: 'terminal',
                    angle: 0,
                    opacity: 1,
                    textHeight: 20,
                    text: {
                        children: [
                            {
                                text: '结束'
                            }
                        ],
                        align: 'center'
                    },
                    points: [
                        [-152.40805846473785, 392.0424757605864],
                        [-6.296362204602474, 479.7238481181446]
                    ],
                    strokeWidth: 2
                },
                {
                    id: 'rJcaT',
                    type: 'geometry',
                    shape: 'decision',
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
                        [-478.931640625, 150.92016662105166],
                        [-308.46799498817535, 253.21510103820273]
                    ],
                    strokeWidth: 2
                },
                {
                    id: 'dBQka',
                    type: 'line',
                    shape: 'elbow',
                    source: {
                        marker: 'none',
                        connection: [0.5, 1],
                        boundId: 'rJcaT'
                    },
                    texts: [
                        {
                            text: {
                                children: [
                                    {
                                        text: '是'
                                    }
                                ]
                            },
                            position: 0.5,
                            width: 14,
                            height: 20
                        }
                    ],
                    target: {
                        marker: 'arrow',
                        connection: [0.5, 0],
                        boundId: 'GMKAE'
                    },
                    opacity: 1,
                    points: [
                        [-417.72637207305854, -445.31316541034334],
                        [-417.72637207305854, -445.31316541034334]
                    ],
                    strokeWidth: 2
                }
            ];
            const options: ElbowLineRouteOptions = {
                sourcePoint: [-393.6998178065877, 253.21510103820273],
                nextSourcePoint: [-393.6998178065877, 285.21510103820276],
                sourceRectangle: {
                    x: -480.931640625,
                    y: 148.92016662105166,
                    width: 174.46364563682465,
                    height: 106.29493441715107
                },
                sourceOuterRectangle: {
                    x: -510.931640625,
                    y: 118.92016662105166,
                    width: 234.46364563682465,
                    height: 166.29493441715107
                },
                targetPoint: [-79.35221033467016, 390.0424757605864],
                nextTargetPoint: [-79.35221033467016, 360.0424757605864],
                targetRectangle: {
                    x: -154.40805846473785,
                    y: 390.0424757605864,
                    width: 150.11169626013537,
                    height: 91.68137235755819
                },
                targetOuterRectangle: {
                    x: -184.40805846473785,
                    y: 360.0424757605864,
                    width: 210.11169626013537,
                    height: 151.6813723575582
                }
            };
            const isHorizontal = false;
            const centerY = RectangleClient.getGapCenter(options.sourceOuterRectangle, options.targetOuterRectangle, isHorizontal);
            const route = generateElbowLineRoute(options);
            verifyOrthogonalPoints(route);
            verifyOrthogonalPointsPassThroughCenterXOrCenterY(route, centerY, isHorizontal);
        });
    });
});

const verifyOrthogonalPoints = (points: Point[]) => {
    for (let index = 1; index < points.length; index++) {
        const previous = points[index - 1];
        const current = points[index];
        expect(Point.isAlign([previous, current])).toBeTrue();
    }
};

const verifyOrthogonalPointsPassThroughCenterXOrCenterY = (points: Point[], center: number, isHorizontal: boolean) => {
    let count = 0;
    const pointIndex = isHorizontal ? 0 : 1;
    for (let index = 0; index < points.length; index++) {
        if (points[index][pointIndex] === center) {
            count++;
        }
    }
    expect(count).toBeGreaterThanOrEqual(2);
};
