import {
    Direction,
    PlaitBoard,
    Point,
    RectangleClient,
    distanceBetweenPointAndPoint,
    drawCircle,
    drawLinearPath,
    isLineHitLine
} from '@plait/core';
import { removeDuplicatePoints } from './line';
import { PointGraph, PointNode } from './graph';

export type options = {
    sourcePoint: any;
    sourceDirection: Direction;
    sourceRectangle: RectangleClient;
    sourceOuterRectangle: any;
    targetPoint: any;
    targetDirection: Direction;
    targetOuterRectangle: any;
    targetRectangle: RectangleClient;
    offset: any;
    board: any;
};

export type NodeInfo = {
    direction: Direction;
    rectangle: RectangleClient;
    outerRectangle: RectangleClient;
};

export const generatorElbowPoints = (infos: options) => {
    let needThroughMiddleX = false;
    let middleX = 0;
    let needThroughMiddleY = false;
    if (!RectangleClient.isHitX(infos.sourceRectangle, infos.targetRectangle)) {
        let leftNode: NodeInfo = {
            direction: infos.sourceDirection,
            rectangle: infos.sourceRectangle,
            outerRectangle: infos.sourceOuterRectangle
        };
        let rightNode: NodeInfo = {
            direction: infos.targetDirection,
            rectangle: infos.targetRectangle,
            outerRectangle: infos.targetOuterRectangle
        };
        if (infos.sourceRectangle.x > infos.targetRectangle.x) {
            const xx = leftNode;
            leftNode = rightNode;
            rightNode = xx;
        }
        middleX = (leftNode.rectangle.x + leftNode.rectangle.width + rightNode.rectangle.x) / 2;
        if (leftNode.direction === Direction.left || rightNode.direction === Direction.right) {
            if (rightNode.direction === Direction.left) {
                const rightMiddleY = rightNode.rectangle.y + rightNode.rectangle.height / 2;
                if (leftNode.outerRectangle.y < rightMiddleY && leftNode.outerRectangle.y + leftNode.outerRectangle.height > rightMiddleY) {
                    needThroughMiddleX = true;
                }
            }
            if (leftNode.direction === Direction.right) {
            }
        } else {
            if (leftNode.direction === rightNode.direction) {
                // 方位相同
            } else {
                // 方位不同
                needThroughMiddleX = true;
            }
        }
    }

    const nextSource = getNextPoint(infos.sourcePoint, infos.sourceOuterRectangle, infos.sourceDirection).map(num =>
        Number(num.toFixed(2))
    ) as Point;
    const nextTarget = getNextPoint(infos.targetPoint, infos.targetOuterRectangle, infos.targetDirection).map(num =>
        Number(num.toFixed(2))
    ) as Point;

    const points = getGraphPoints({ ...infos, nextSource, nextTarget });
    const graph = createGraph(infos.board, points);
    points.forEach(point => {
        const circle = drawCircle(PlaitBoard.getRoughSVG(infos.board), point, 3, {
            stroke: 'red',
            strokeWidth: 1,
            fill: 'red',
            fillStyle: 'solid'
        });
        PlaitBoard.getElementActiveHost(infos.board).appendChild(circle);
    });

    const aStar = new AStar(graph);

    const a = aStar.search(nextSource, nextTarget, needThroughMiddleX ? middleX : undefined);
    let temp = nextTarget;
    const path = [];
    while (temp[0] !== nextSource[0] || temp[1] !== nextSource[1]) {
        const node = graph.get(temp);
        const preNode = a.get(node!);
        path.push(preNode!.data);
        temp = preNode!.data;
    }
    const line = drawLinearPath([nextTarget, ...path, nextSource], {
        stroke: 'red',
        strokeWidth: 3
    });
    PlaitBoard.getElementActiveHost(infos.board).appendChild(line);
    return points;
};

export const computeOuterRectangle = (rectangle: RectangleClient, offset: number[]) => {
    const leftTopPoint: Point = [rectangle.x - offset[3], rectangle.y - offset[0]];
    const rightBottomPoint: Point = [rectangle.x + rectangle.width + offset[1], rectangle.y + rectangle.height + offset[2]];
    return RectangleClient.toRectangleClient([leftTopPoint, rightBottomPoint]);
};

export const computeRectangleOffset = (sourceRectangle: RectangleClient, targetRectangle: RectangleClient) => {
    const defaultOffset = 30;
    let sourceOffset = new Array(4).fill(defaultOffset);
    let targetOffset = new Array(4).fill(defaultOffset);
    const sourceOuterRectangle = RectangleClient.inflate(sourceRectangle, 60);
    const targetOuterRectangle = RectangleClient.inflate(targetRectangle, 60);
    const isHit = RectangleClient.isHit(sourceOuterRectangle, targetOuterRectangle);
    if (isHit) {
        const leftToRight = sourceRectangle.x - (targetRectangle.x + targetRectangle.width);
        const rightToLeft = targetRectangle.x - (sourceRectangle.x + sourceRectangle.width);
        if (leftToRight > 0 && leftToRight < defaultOffset * 2) {
            const offset = leftToRight / 2;
            sourceOffset[3] = offset;
            targetOffset[1] = offset;
        }

        if (rightToLeft > 0 && rightToLeft < defaultOffset * 2) {
            const offset = rightToLeft / 2;
            targetOffset[3] = offset;
            sourceOffset[1] = offset;
        }

        const topToBottom = sourceRectangle.y - (targetRectangle.y + targetRectangle.height);
        const bottomToTop = targetRectangle.y - (sourceRectangle.y + sourceRectangle.height);
        if (topToBottom > 0 && topToBottom < defaultOffset * 2) {
            const offset = topToBottom / 2;
            sourceOffset[0] = offset;
            targetOffset[2] = offset;
        }
        if (bottomToTop > 0 && bottomToTop < defaultOffset * 2) {
            const offset = bottomToTop / 2;
            sourceOffset[2] = offset;
            targetOffset[0] = offset;
        }
    }
    return { sourceOffset, targetOffset };
};

export const getGraphPoints = (infos: any) => {
    const { nextSource, nextTarget, sourceOuterRectangle, sourceRectangle, targetOuterRectangle, targetRectangle, offset, board } = infos;
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
    x.push((rectanglesX[1] + rectanglesX[2]) / 2, nextSource[0], nextTarget[0]);

    const rectanglesY = [
        sourceOuterRectangle.y,
        sourceOuterRectangle.y + sourceOuterRectangle.height,
        targetOuterRectangle.y,
        targetOuterRectangle.y + targetOuterRectangle.height
    ].sort((a, b) => a - b);
    y.push((rectanglesY[1] + rectanglesY[2]) / 2, nextSource[1], nextTarget[1]);

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
    points = points.map(point => {
        return point.map(num => Number(num.toFixed(2))) as Point;
    });

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

export const getNextPoint = (point: Point, outerRectangle: RectangleClient, direction: Direction): Point => {
    switch (direction) {
        case Direction.top: {
            return [point[0], outerRectangle.y];
        }
        case Direction.bottom: {
            return [point[0], outerRectangle.y + outerRectangle.height];
        }
        case Direction.right: {
            return [outerRectangle.x + outerRectangle.width, point[1]];
        }
        default: {
            return [outerRectangle.x, point[1]];
        }
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
    heuristic(a: Point, b: Point) {
        return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    }

    search(start: Point, end: Point, middleX: number | undefined) {
        console.log(middleX);
        const frontier = new PriorityQueue();
        const startNode = this.graph.get(start);
        const cameFrom = new Map<PointNode, PointNode>();
        const costSoFar = new Map<PointNode, number>();
        costSoFar.set(startNode!, 0);
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
                let newCost = costSoFar.get(current!.node)! + number;
                if (!costSoFar.has(next) || (costSoFar.get(next) && newCost < costSoFar.get(next)!)) {
                    const previousNode = cameFrom.get(current!.node);
                    // 拐点权重
                    if (previousNode) {
                        const x = previousNode.data[0] === current?.node.data[0] && previousNode.data[0] === next.data[0];
                        const y = previousNode.data[1] === current?.node.data[1] && previousNode.data[1] === next.data[1];
                        if (!x && !y) {
                            newCost = newCost + 1;
                        }
                        
                    } else {
                        //
                    }
                    if (middleX !== undefined) {
                        if (
                            Math.floor((current as any).node.data[0]) === Math.floor(middleX) &&
                            Math.floor(next.data[0]) === Math.floor(middleX)
                        ) {
                            newCost = newCost - 1;
                            console.log('xxx');
                            // a = true;
                        }
                    }
                    costSoFar.set(next, newCost);
                    const priority = newCost + this.heuristic(next.data, end);
                    frontier.enqueue({ node: next, priority });
                    cameFrom.set(next, current!.node);
                }
            });
        }

        return cameFrom;
    }
}
