import { PlaitBoard, Point, RectangleClient, distanceBetweenPointAndPoint, drawCircle, drawLinearPath, isLineHitLine } from '@plait/core';
import { removeDuplicatePoints } from './line';
import { PointGraph, PointNode } from './Graph';

export const generatorElbowPoints = (infos: any) => {
    const points = getGraphPoints(infos);
    const graph = createGraph(infos.board, points);
    const sourceOuterRectangle = RectangleClient.inflate(infos.sourceRectangle, 60);
    const targetOuterRectangle = RectangleClient.inflate(infos.targetRectangle, 60);
    const aStar = new AStar(graph);
    const source = getNextPoint(infos.sourceRectangle, infos.sourcePoint, sourceOuterRectangle);
    const target = getNextPoint(infos.targetRectangle, infos.targetPoint, targetOuterRectangle);

    // [source, target].forEach(point => {
    //     const circle = drawCircle(PlaitBoard.getRoughSVG(infos.board), point, 3, {
    //         stroke: 'green',
    //         strokeWidth: 3,
    //         fill: 'green',
    //         fillStyle: 'solid'
    //     });
    //     PlaitBoard.getElementActiveHost(infos.board).appendChild(circle);
    // });

    const a = aStar.search(source, target);
    let temp = target;
    const path = [];
    while (temp[0] !== source[0] || temp[1] !== source[1]) {
        const node = graph.get(temp);
        const preNode = a.get(node!);
        path.push(preNode!.data);
        temp = preNode!.data;
    }
    const line = drawLinearPath([target, ...path, source], {
        stroke: 'red',
        strokeWidth: 3
    });
    PlaitBoard.getElementActiveHost(infos.board).appendChild(line);
    return points;
};

export const getGraphPoints = (infos: any) => {
    const { sourcePoint, sourceDirection, sourceRectangle, targetPoint, targetDirection, targetRectangle, offset, board } = infos;
    const sourceOuterRectangle = RectangleClient.inflate(sourceRectangle, 60);
    const targetOuterRectangle = RectangleClient.inflate(targetRectangle, 60);
    const x: number[] = [];
    const y: number[] = [];
    let result: Point[] = [];

    [sourceOuterRectangle, targetOuterRectangle].forEach(rectangle => {
        x.push(rectangle.x, rectangle.x + rectangle.width / 2, rectangle.x + rectangle.width);
        y.push(rectangle.y, rectangle.y + rectangle.height / 2, rectangle.y + rectangle.height);
    });
    const rectanglesX = [
        sourceOuterRectangle.x,
        sourceOuterRectangle.x + sourceOuterRectangle.width,
        targetOuterRectangle.x,
        targetOuterRectangle.x + targetOuterRectangle.width
    ].sort((a, b) => a - b);
    x.push((rectanglesX[1] + rectanglesX[2]) / 2);

    const rectanglesY = [
        sourceOuterRectangle.y,
        sourceOuterRectangle.y + sourceOuterRectangle.height,
        targetOuterRectangle.y,
        targetOuterRectangle.y + targetOuterRectangle.height
    ].sort((a, b) => a - b);
    y.push((rectanglesY[1] + rectanglesY[2]) / 2);

    for (let i = 0; i < x.length; i++) {
        for (let j = 0; j < y.length; j++) {
            const point: Point = [x[i], y[j]];

            const isInSource = isPointInRectangle(sourceOuterRectangle, point);
            const isInTarget = isPointInRectangle(targetOuterRectangle, point);

            if (!isInSource && !isInTarget) {
                result.push(point);
            }
        }
    }

    result = removeDuplicatePoints(result);
    result = result.filter(point => {
        const isInSource = isPointInRectangle(sourceOuterRectangle, point);
        const isInTarget = isPointInRectangle(targetOuterRectangle, point);
        return !isInSource && !isInTarget;
    });

    return result;
};

export const createGraph = (board: PlaitBoard, points: Point[]) => {
    const graph = new PointGraph();
    const hotXs: number[] = [];
    const hotYs: number[] = [];
    const connections: Point[][] = [];

    points.forEach(p => {
        const x = p[0],
            y = p[1];
        if (hotXs.indexOf(x) < 0) hotXs.push(x);
        if (hotYs.indexOf(y) < 0) hotYs.push(y);
        graph.add(p);
    });

    hotXs.sort((a, b) => a - b);
    hotYs.sort((a, b) => a - b);

    const inHotIndex = (p: Point): boolean => graph.has(p);

    for (let i = 0; i < hotXs.length; i++) {
        for (let j = 0; j < hotYs.length; j++) {
            const point: Point = [hotXs[i], hotYs[j]];
            if (!inHotIndex(point)) continue;

            if (i > 0) {
                const otherPoint: Point = [hotXs[i - 1], hotYs[j]];
                if (inHotIndex(otherPoint)) {
                    graph.connect(otherPoint, point);
                    graph.connect(point, otherPoint);
                    connections.push([point, otherPoint]);
                }
            }

            if (j > 0) {
                const otherPoint: Point = [hotXs[i], hotYs[j - 1]];
                if (inHotIndex(otherPoint)) {
                    graph.connect(otherPoint, point);
                    graph.connect(point, otherPoint);
                    connections.push([point, otherPoint]);
                }
            }
        }
    }
    PlaitBoard.getElementActiveHost(board).childNodes.forEach(node => node.remove());
    connections.forEach(linePoints => {
        const line = PlaitBoard.getRoughSVG(board).line(...linePoints[0], ...linePoints[1], {
            stroke: 'blue',
            strokeWidth: 1,
            fillStyle: 'solid'
        });
        PlaitBoard.getElementActiveHost(board).appendChild(line);
    });

    return graph;
};

export const isPointInRectangle = (rectangle: RectangleClient, point: Point) => {
    const x = point[0],
        y = point[1];
    return x > rectangle.x && x < rectangle.x + rectangle.width && y > rectangle.y && y < rectangle.y + rectangle.height;
};

export const isLineIntersectRectangle = (a: Point, b: Point, points: Point[]) => {
    const len = points.length;
    for (let i = 0; i < len; i++) {
        const p = points[i];
        const p2 = points[(i + 1) % len];
        if (isLineHitLine(a, b, p, p2)) {
            return true;
        }
    }
    return false;
};

export const getNextPoint = (rectangle: RectangleClient, point: Point, outerRectangle: RectangleClient): Point => {
    function almostEqual(number1: number, number2: number) {
        return Math.abs(number1 - number2) < 0.1;
    }
    if (almostEqual(point[0], rectangle.x)) {
        return [outerRectangle.x, point[1]];
    } else if (almostEqual(point[0], rectangle.x + rectangle.width)) {
        return [outerRectangle.x + outerRectangle.width, point[1]];
    } else if (almostEqual(point[1], rectangle.y)) {
        return [point[0], outerRectangle.y];
    } else {
        return [point[0], outerRectangle.y + outerRectangle.height];
    }
};

class PriorityQueue {
    list: { node: PointNode; priority: number }[];
    constructor() {
        this.list = [];
    }
    enqueue(item: { node: PointNode; priority: number }) {
        this.list.push(item);
    }
    dequeue() {
        this.list = this.list.sort((item1, item2) => item1.priority - item2.priority);
        return this.list.shift();
    }
}

class AStar {
    constructor(private graph: PointGraph) {}
    heuristic(a: PointNode, b: PointNode) {
        return distanceBetweenPointAndPoint(...a.data, ...b.data);
    }

    search(start: Point, end: Point) {
        const frontier = new PriorityQueue();
        const startNode = this.graph.get(start);
        const cameFrom = new Map<PointNode, PointNode>();
        const costSoFar = new Map<PointNode, number>();
        frontier.enqueue({ node: startNode!, priority: 0 });
        while (frontier.list.length > 0) {
            var current = frontier.dequeue();

            if (!current) {
                throw new Error(`can't find current`);
            }
            const currentPoint = current!.node.data;
            if (currentPoint[0] === end[0] && currentPoint[1] === end[1]) {
                break;
            }
            current.node.adjacentNodes.forEach((number, next) => {
                const newCost = costSoFar.get(current!.node)! + distanceBetweenPointAndPoint(...current!.node.data, ...next.data);
                if (!costSoFar.has(next) || (costSoFar.get(next) && newCost < costSoFar.get(next)!)) {
                    costSoFar.set(next, newCost);
                    const priority = newCost + distanceBetweenPointAndPoint(...next.data, ...end);
                    frontier.enqueue({ node: next, priority });
                    cameFrom.set(next, current!.node);
                }
            });
        }

        return cameFrom;
    }
}
