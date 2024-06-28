import { PlaitMindBoard } from '@plait/mind';
import { PlaitBoard, Point, RectangleClient, RgbaToHEX, createG, getElementById } from '@plait/core';
import { PlaitDrawElement, PlaitGeometry, getArrowLineHandleRefPair, getStrokeWidthByElement } from '@plait/draw';
import {
    AStar,
    ElbowLineRouteOptions,
    PriorityQueue,
    createGraph,
    getGraphPoints,
    getNextPoint,
    isSourceAndTargetIntersect,
    reduceRouteMargin,
    routeAdjust
} from '@plait/common';

export const withLineRoute = (board: PlaitBoard) => {
    const newBoard = board as PlaitBoard & PlaitMindBoard;
    const { pointerMove } = newBoard;
    let g: null | SVGGElement;

    newBoard.pointerMove = (event: PointerEvent) => {
        g?.remove();
        g = fakeLineRouteProcess(board);
        return pointerMove(event);
    };

    setTimeout(() => {
        // 初始化渲染
        g = fakeLineRouteProcess(board);
    }, 0);

    return newBoard;
};

export const fakeLineRouteProcess = (board: PlaitBoard) => {
    const g = createG();
    PlaitBoard.getElementActiveHost(board).append(g);
    const rough = PlaitBoard.getRoughSVG(board);
    const lineElement = getElementById(board, mockLineData[2].id);
    const handleRefPair = lineElement && PlaitDrawElement.isArrowLine(lineElement) && getArrowLineHandleRefPair(board, lineElement);
    const sourceElement = lineElement && lineElement.source.boundId && getElementById<PlaitGeometry>(board, lineElement.source.boundId);
    const targetElement = lineElement && lineElement.target.boundId && getElementById<PlaitGeometry>(board, lineElement.target.boundId);
    if (lineElement && sourceElement && targetElement && handleRefPair) {
        // 1、Prepare Data: source, target Rectangle
        const targetRectangle = RectangleClient.inflate(
            RectangleClient.getRectangleByPoints(targetElement.points),
            getStrokeWidthByElement(targetElement) * 2
        );
        const sourceRectangle = RectangleClient.inflate(
            RectangleClient.getRectangleByPoints(sourceElement.points),
            getStrokeWidthByElement(sourceElement) * 2
        );
        const sourceRectG = rough.rectangle(sourceRectangle.x, sourceRectangle.y, sourceRectangle.width, sourceRectangle.height, {
            stroke: '#a287e1'
        });
        const targetRectG = rough.rectangle(targetRectangle.x, targetRectangle.y, targetRectangle.width, targetRectangle.height, {
            stroke: '#e03130'
        });
        g.append(sourceRectG);
        g.append(targetRectG);

        const sourcePoint = handleRefPair.source.point;
        const targetPoint = handleRefPair.target.point;
        // 1、Prepare data: source, target outer Rectangle
        const { sourceOffset, targetOffset } = reduceRouteMargin(sourceRectangle, targetRectangle);
        const sourceOuterRectangle = RectangleClient.expand(
            sourceRectangle,
            sourceOffset[3],
            sourceOffset[0],
            sourceOffset[1],
            sourceOffset[2]
        );
        const targetOuterRectangle = RectangleClient.expand(
            targetRectangle,
            targetOffset[3],
            targetOffset[0],
            targetOffset[1],
            targetOffset[2]
        );
        const sourceOuterRectG = rough.rectangle(
            sourceOuterRectangle.x,
            sourceOuterRectangle.y,
            sourceOuterRectangle.width,
            sourceOuterRectangle.height,
            {
                stroke: '#a287e1'
            }
        );
        const targetOuterRectG = rough.rectangle(
            targetOuterRectangle.x,
            targetOuterRectangle.y,
            targetOuterRectangle.width,
            targetOuterRectangle.height,
            {
                stroke: '#e03130'
            }
        );
        g.append(sourceOuterRectG);
        g.append(targetOuterRectG);

        const nextSourcePoint = getNextPoint(sourcePoint, sourceOuterRectangle, handleRefPair.source.direction);
        const nextTargetPoint = getNextPoint(targetPoint, targetOuterRectangle, handleRefPair.target.direction);

        const nextSourceG = rough.circle(nextSourcePoint[0], nextSourcePoint[1], 8, {
            stroke: '#a287e1',
            fill: '#a287e1',
            fillStyle: 'solid'
        });

        const nextTargetG = rough.circle(nextTargetPoint[0], nextTargetPoint[1], 8, {
            stroke: '#e03130',
            fill: '#e03130',
            fillStyle: 'solid'
        });

        g.append(nextSourceG);
        g.append(nextTargetG);

        const options: ElbowLineRouteOptions = {
            sourcePoint,
            nextSourcePoint,
            sourceRectangle,
            sourceOuterRectangle,
            targetPoint,
            nextTargetPoint,
            targetRectangle,
            targetOuterRectangle
        };
        const isIntersect = isSourceAndTargetIntersect(options);
        if (!isIntersect) {
            const options = {
                sourcePoint,
                nextSourcePoint,
                sourceRectangle,
                sourceOuterRectangle,
                targetPoint,
                nextTargetPoint,
                targetRectangle,
                targetOuterRectangle
            };
            // 2、Construct connected points
            const points = getGraphPoints(options);
            points.forEach(p => {
                const controlPointG = rough.circle(p[0], p[1], 4, {
                    stroke: '#f08c02',
                    fill: '#f08c02',
                    fillStyle: 'solid'
                });
                g?.append(controlPointG);
            });
            // 3、Construct graph structure
            const graph = createGraph(points);

            // Get graph edges
            const edges: [Point, Point][] = [];
            const frontier = new PriorityQueue();
            const startNode = graph.get(nextSourcePoint);
            frontier.enqueue({ node: startNode!, priority: 0 });
            const reached = new Set();
            reached.add(startNode);
            while (frontier.list.length > 0) {
                var current = frontier.dequeue();
                if (!current) {
                    throw new Error(`can't find current`);
                }
                const currentPoint = current!.node.data;
                current.node.adjacentNodes.forEach(next => {
                    if (!reached.has(next)) {
                        reached.add(next);
                        frontier.enqueue({ node: next, priority: 0 });
                    }
                    if (
                        !edges.find(line => {
                            return Point.isEquals(line[0], next.data) && Point.isEquals(line[1], currentPoint);
                        })
                    ) {
                        edges.push([currentPoint, next.data]);
                    }
                });
            }
            // Figure edges effect diagram
            edges.forEach(edges => {
                const connectionG = rough.line(edges[0][0], edges[0][1], edges[1][0], edges[1][1], {
                    stroke: RgbaToHEX('#007500', 0.2),
                    strokeWidth: 1.5
                });
                g?.append(connectionG);
            });

            // 4、Run A* algorithm: get the shortest path with the fewest turning points
            const aStar = new AStar(graph);
            aStar.search(nextSourcePoint, nextTargetPoint, options.sourcePoint);
            let route = aStar.getRoute(nextSourcePoint, nextTargetPoint);
            route = [options.sourcePoint, ...route, nextTargetPoint, options.targetPoint];
            const routeG = rough.linearPath(route, { stroke: RgbaToHEX('#e03130', 0.4), strokeWidth: 3 });
            g.append(routeG);
            // 5、Correct the shortest path: get the midline xAxis, yAxis between figures (if they exist)
            const isHitX = RectangleClient.isHitX(options.sourceOuterRectangle, options.targetOuterRectangle);
            const isHitY = RectangleClient.isHitY(options.sourceOuterRectangle, options.targetOuterRectangle);
            const centerX = isHitX
                ? undefined
                : RectangleClient.getGapCenter(options.sourceOuterRectangle, options.targetOuterRectangle, true);
            const centerY = isHitY
                ? undefined
                : RectangleClient.getGapCenter(options.sourceOuterRectangle, options.targetOuterRectangle, false);
            // 5、纠正最短路径：基于中线 xAxis、yAxis 和最短路径对拐点进行纠正，使拐点经过中线
            route = routeAdjust(route, {
                centerX,
                centerY,
                sourceRectangle: options.sourceRectangle,
                targetRectangle: options.targetRectangle
            });
            const finalRouteG = rough.linearPath(route, { stroke: '#2f9e44', strokeWidth: 4 });
            g.append(finalRouteG);
        }
    }
    return g;
};

export const mockLineData = [
    {
        id: 'XnXZY',
        type: 'geometry',
        shape: 'rectangle',
        angle: 0,
        opacity: 1,
        textHeight: 20,
        text: {
            children: [
                {
                    text: 'Start'
                }
            ],
            align: 'center'
        },
        points: [
            [-380.7430419921875, -228.69085693359375],
            [-280.8197021484375, -181.00042724609375]
        ],
        strokeWidth: 2
    },
    {
        id: 'rTZnC',
        type: 'geometry',
        shape: 'rectangle',
        angle: 0,
        opacity: 1,
        textHeight: 20,
        text: {
            children: [
                {
                    text: 'End'
                }
            ],
            align: 'center'
        },
        points: [
            [120.59680175781295, -69.57891845703125],
            [215.58068847656273, -23.48297119140625]
        ],
        strokeWidth: 2
    },
    {
        id: 'bwZpx',
        type: 'line',
        shape: 'elbow',
        source: {
            marker: 'none',
            connection: [1, 0.5],
            boundId: 'XnXZY'
        },
        texts: [],
        target: {
            marker: 'arrow',
            connection: [0, 0.5],
            boundId: 'rTZnC'
        },
        opacity: 1,
        points: [
            [-175.74560546875, -110.6083984375],
            [56.7352294921875, -114.374755859375]
        ],
        strokeColor: '#000',
        strokeWidth: 2
    },
    {
        id: 'ABywa',
        type: 'geometry',
        shape: 'text',
        angle: 0,
        opacity: 1,
        textHeight: 45,
        text: {
            children: [
                {
                    text: 'Red connection: the shortest path with the fewest turning points obtained by the A* algorithm',
                    color: '#e03130',
                    'font-size': 15
                }
            ]
        },
        points: [
            [379.8231201171873, -167.06341552734375],
            [861.4403076171873, -122.06341552734375]
        ],
        autoSize: true
    },
    {
        id: 'nMNim',
        type: 'geometry',
        shape: 'text',
        angle: 0,
        opacity: 1,
        textHeight: 45,
        text: {
            children: [
                {
                    text:
                        'Green connection: the connection through the center line corrected based on the shortest path with the fewest turning points',
                    color: '#2f9e44',
                    'font-size': 15
                }
            ]
        },
        points: [
            [379.8231201171873, -105.19818115234375],
            [850.5028076171873, -60.19818115234375]
        ],
        autoSize: true
    },
    {
        id: 'Earta',
        type: 'geometry',
        shape: 'text',
        angle: 0,
        opacity: 1,
        textHeight: 22.5,
        text: {
            children: [
                {
                    text: 'Orange point: Constructed virtual connectivity control point',
                    color: '#f08c02',
                    'font-size': 15
                }
            ]
        },
        points: [
            [379.8231201171873, -206.42864990234375],
            [802.4403076171873, -183.92864990234375]
        ],
        autoSize: true
    }
    // turning points note
    // {
    //     id: 'TmwRd',
    //     type: 'geometry',
    //     shape: 'text',
    //     angle: 0,
    //     opacity: 1,
    //     textHeight: 22.5,
    //     text: {
    //         children: [
    //             {
    //                 text: 'Fewer turning points',
    //                 color: '#e03130',
    //                 'font-size': 15
    //             }
    //         ]
    //     },
    //     points: [
    //         [-70.67498779296875, -234.2685546875],
    //         [80.80157470703125, -211.7685546875]
    //     ],
    //     autoSize: true
    // },
    // {
    //     id: 'QhYch',
    //     type: 'geometry',
    //     shape: 'text',
    //     angle: 0,
    //     opacity: 1,
    //     textHeight: 22.5,
    //     text: {
    //         children: [
    //             {
    //                 text: 'More turning points',
    //                 color: '#1871c2',
    //                 'font-size': 15
    //             }
    //         ]
    //     },
    //     points: [
    //         [-70.67498779296875, -131.921630859375],
    //         [74.52032470703125, -109.421630859375]
    //     ],
    //     autoSize: true
    // },
    // {
    //     id: 'drFzQ',
    //     type: 'line',
    //     shape: 'elbow',
    //     source: {
    //         marker: 'none'
    //     },
    //     texts: [],
    //     target: {
    //         marker: 'none'
    //     },
    //     opacity: 1,
    //     points: [
    //         [-245.88592529296875, -201.5302734375],
    //         [-245.88592529296875, -148.3974609375]
    //     ],
    //     strokeWidth: 2,
    //     strokeColor: '#1871c2'
    // },
    // {
    //     id: 'SNQfA',
    //     type: 'line',
    //     shape: 'straight',
    //     source: {
    //         marker: 'none'
    //     },
    //     texts: [],
    //     target: {
    //         marker: 'none'
    //     },
    //     opacity: 1,
    //     points: [
    //         [-246.67889404296875, -147.6669921875],
    //         [-75.87811279296875, -147.6669921875]
    //     ],
    //     strokeWidth: 2,
    //     strokeColor: '#1871c2'
    // },
    // {
    //     id: 'BBMPW',
    //     type: 'line',
    //     shape: 'elbow',
    //     source: {
    //         marker: 'none'
    //     },
    //     texts: [],
    //     target: {
    //         marker: 'none'
    //     },
    //     opacity: 1,
    //     points: [
    //         [-76.45233154296875, -148.1591796875],
    //         [-76.45233154296875, -95.0263671875]
    //     ],
    //     strokeWidth: 2,
    //     strokeColor: '#1871c2'
    // },
    // {
    //     id: 'ikjbe',
    //     type: 'line',
    //     shape: 'straight',
    //     source: {
    //         marker: 'none'
    //     },
    //     texts: [],
    //     target: {
    //         marker: 'none'
    //     },
    //     opacity: 1,
    //     points: [
    //         [-77.79217529296875, -94.1708984375],
    //         [81.92266845703125, -94.1708984375]
    //     ],
    //     strokeWidth: 2,
    //     strokeColor: '#1871c2'
    // },
    // {
    //     id: 'dpKYw',
    //     type: 'line',
    //     shape: 'elbow',
    //     source: {
    //         marker: 'none'
    //     },
    //     texts: [],
    //     target: {
    //         marker: 'none'
    //     },
    //     opacity: 1,
    //     points: [
    //         [81.93438720703125, -94.8779296875],
    //         [81.93438720703125, -61.6748046875]
    //     ],
    //     strokeWidth: 2,
    //     strokeColor: '#1871c2'
    // },
    // {
    //     id: 'HmJbj',
    //     type: 'line',
    //     shape: 'straight',
    //     source: {
    //         marker: 'none'
    //     },
    //     texts: [],
    //     target: {
    //         marker: 'arrow'
    //     },
    //     opacity: 1,
    //     points: [
    //         [81.58282470703125, -60.8818359375],
    //         [118.4559936523442, -60.8818359375]
    //     ],
    //     strokeWidth: 2,
    //     strokeColor: '#1871c2'
    // }
] as PlaitDrawElement[];
