import { Point, RectangleClient } from '@plait/core';
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
            const centerX = RectangleClient.getGapCenter(options.sourceOuterRectangle, options.targetOuterRectangle, true);
            const route = generateElbowLineRoute(options);
            verifyOrthogonalPoints(route);
            verifyOrthogonalPointsPassThroughCenterX(route, centerX);
        });
        it('Obtain the incorrect corner points in the processing of adjust by centerX', () => {
            // can not obtain the incorrect data
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

const verifyOrthogonalPointsPassThroughCenterX = (points: Point[], centerX: number) => {
    let count = 0;
    for (let index = 0; index < points.length; index++) {
        if (points[index][0] === centerX) {
            count++;
        }
    }
    expect(count).toBeGreaterThanOrEqual(2);
};
