import { PlaitMindBoard } from '@plait/mind';
import { PlaitBoard, RectangleClient, createG, getElementById, getMovingElements } from '@plait/core';
import { PlaitDrawElement, PlaitGeometry, PlaitLine, getLineHandleRefPair, getStrokeWidthByElement } from '@plait/draw';
import {
    AStar,
    createGraph,
    getGraphPoints,
    getNextPoint,
    getRectangleByPoints,
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
        PlaitBoard.getElementActiveHost(board).append(g);
        return pointerMove(event);
    };

    setTimeout(() => {
        // 初始化渲染
        g = fakeLineRouteProcess(board);
        PlaitBoard.getElementActiveHost(board).append(g);
    }, 0);

    return newBoard;
};

export const fakeLineRouteProcess = (board: PlaitBoard) => {
    const g = createG();
    const rough = PlaitBoard.getRoughSVG(board);
    const lineElement = getElementById(board, mockLineData[2].id);
    const handleRefPair = lineElement && PlaitDrawElement.isLine(lineElement) && getLineHandleRefPair(board, lineElement);
    const sourceElement = lineElement && lineElement.source.boundId && getElementById<PlaitGeometry>(board, lineElement.source.boundId);
    const targetElement = lineElement && lineElement.target.boundId && getElementById<PlaitGeometry>(board, lineElement.target.boundId);
    if (lineElement && sourceElement && targetElement && handleRefPair) {
        // 1、准备数据：源/目标 Rectangle
        const targetRectangle = RectangleClient.inflate(
            getRectangleByPoints(targetElement.points),
            getStrokeWidthByElement(targetElement) * 2
        );
        const sourceRectangle = RectangleClient.inflate(
            getRectangleByPoints(sourceElement.points),
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
        // 1、准备数据：源、目标外围 Rectangle
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

        const isIntersect =
            RectangleClient.isPointInRectangle(targetRectangle, sourcePoint) ||
            RectangleClient.isPointInRectangle(targetOuterRectangle, nextSourcePoint) ||
            RectangleClient.isPointInRectangle(sourceOuterRectangle, nextTargetPoint) ||
            RectangleClient.isPointInRectangle(sourceRectangle, targetPoint);
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
            // 2、构造连通点
            const points = getGraphPoints(options);
            points.forEach(p => {
                const controlPointG = rough.circle(p[0], p[1], 4, {
                    stroke: '#f08c02',
                    fill: '#f08c02',
                    fillStyle: 'solid'
                });
                g?.append(controlPointG);
            });
            // 3、构造图结构
            const graph = createGraph(points);

            // 4、跑 A* 算法：获取拐点最少的最短路径
            const aStar = new AStar(graph);
            aStar.search(nextSourcePoint, nextTargetPoint, options.sourcePoint);
            let route = aStar.getRoute(nextSourcePoint, nextTargetPoint);
            route = [options.sourcePoint, ...route, nextTargetPoint, options.targetPoint];
            const routeG = rough.linearPath(route, { stroke: '#e03130', strokeWidth: 3 });
            g.append(routeG);
            // 5、纠正最短路径：获取图形间的中线 xAxis、yAxis（如果存在）
            const isHitX = RectangleClient.isHitX(options.sourceOuterRectangle, options.targetOuterRectangle);
            const isHitY = RectangleClient.isHitY(options.sourceOuterRectangle, options.targetOuterRectangle);
            const xAxis = isHitX
                ? undefined
                : RectangleClient.getGapCenter(options.sourceOuterRectangle, options.targetOuterRectangle, false);
            const yAxis = isHitY
                ? undefined
                : RectangleClient.getGapCenter(options.sourceOuterRectangle, options.targetOuterRectangle, true);
            // 5、纠正最短路径：基于中线 xAxis、yAxis 和最短路径对拐点进行纠正，使拐点经过中线
            route = routeAdjust(route, {
                xAxis,
                yAxis,
                sourceRectangle: options.sourceRectangle,
                targetRectangle: options.targetRectangle
            });
            const finalRouteG = rough.linearPath(route, { stroke: '#2f9e44', strokeWidth: 2.5 });
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
                    text: '开始'
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
                    text: '结束'
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
        textHeight: 20,
        text: {
            children: [
                {
                    text: '红色连线：A* 算法得到的拐点最少的最短路径',
                    color: '#e03130'
                }
            ]
        },
        points: [
            [379.8231201171873, -165.77630615234375],
            [674.7684326171873, -145.77630615234375]
        ],
        autoSize: true
    },
    {
        id: 'nMNim',
        type: 'geometry',
        shape: 'text',
        angle: 0,
        opacity: 1,
        textHeight: 20,
        text: {
            children: [
                {
                    text: '绿色连线：基于拐点最少的最短路径纠正的经过中线的连线',
                    color: '#2f9e44'
                }
            ]
        },
        points: [
            [379.8231201171873, -125.12396240234375],
            [751.8231201171873, -105.12396240234375]
        ],
        autoSize: true
    },
    {
        id: 'Earta',
        type: 'geometry',
        shape: 'text',
        angle: 0,
        opacity: 1,
        textHeight: 20,
        text: {
            children: [
                {
                    text: '橙色点：构造的虚拟连通控制点',
                    color: '#f08c02'
                }
            ]
        },
        points: [
            [379.8231201171873, -206.42864990234375],
            [583.8231201171873, -186.42864990234375]
        ],
        autoSize: true
    }
] as PlaitDrawElement[];
