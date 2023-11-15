import { Direction, Point, RectangleClient, isLineHitLine } from '@plait/core';
import { removeDuplicatePoints } from './line';
import { PointGraph, PointNode } from './graph';
import { ELBOW_LINE_OFFSET } from '../constants/line';

export type Options = {
    sourcePoint: Point;
    nextSourcePoint: Point;
    sourceRectangle: RectangleClient;
    sourceOuterRectangle: RectangleClient;
    targetPoint: Point;
    nextTargetPoint: Point;
    targetOuterRectangle: RectangleClient;
    targetRectangle: RectangleClient;
};

export const generatorElbowPoints = (infos: Options) => {
    const { nextSourcePoint, nextTargetPoint } = infos;
    const points = getGraphPoints(infos);
    const graph = createGraph(points);
    const aStar = new AStar(graph);
    const a = aStar.search(nextSourcePoint, nextTargetPoint, infos.sourcePoint);
    let temp = nextTargetPoint;
    let path: Point[] = [nextTargetPoint, infos.targetPoint];
    while (temp[0] !== nextSourcePoint[0] || temp[1] !== nextSourcePoint[1]) {
        const node = graph.get(temp);
        const preNode = a.get(node!);
        path.unshift(preNode!.data);
        temp = preNode!.data;
    }
    path = [infos.sourcePoint, ...path];
    path = handleMiddlePoint(path, infos);
    return path;
};

const handleMiddlePoint = (path: Point[], infos: Options) => {
    // 基于 middleX/middleY 中线纠正 path
    // 1. 找垂直/水平的线段
    // 2. 找到和middleX/middleY相交的点
    // 3. 基于垂直/水平的线段分别和相交点构建矩形
    // 4. 判断矩形相交
    // 5. 处理 path
    const { sourceRectangle, sourceOuterRectangle, targetRectangle, targetOuterRectangle } = infos;

    function getMiddleResult(isHit: boolean, isHorizontal: boolean) {
        const middle = isHit ? 0 : getMiddleLine(sourceOuterRectangle, targetOuterRectangle, !isHorizontal);
        const options = getAdjustOptions(path, middle, isHorizontal);
        return (
            options.pointOfInterSection &&
            adjust(options.parallelPaths, options.pointOfInterSection, path, sourceRectangle, targetRectangle)
        );
    }

    const isHitX = RectangleClient.isHitX(sourceOuterRectangle, targetOuterRectangle);
    const isHitY = RectangleClient.isHitY(sourceOuterRectangle, targetOuterRectangle);
    const resultX = getMiddleResult(isHitX, true);
    const resultY = getMiddleResult(isHitY, false);
    if (resultX) {
        path = resultX;
    }
    if (resultY) {
        path = resultY;
    }
    return path;
};

const getMiddleLine = (rectangle1: RectangleClient, rectangle2: RectangleClient, isHorizontal: boolean) => {
    const axis = isHorizontal ? 'y' : 'x';
    const side = isHorizontal ? 'height' : 'width';
    const align = [rectangle1[axis], rectangle1[axis] + rectangle1[side], rectangle2[axis], rectangle2[axis] + rectangle2[side]];
    const sortArr = align.sort((a, b) => a - b);
    return (sortArr[1] + sortArr[2]) / 2;
};

const adjust = (
    parallelPaths: [Point, Point][],
    pointOfInterSection: Point,
    path: Point[],
    sourceRectangle: RectangleClient,
    targetRectangle: RectangleClient
) => {
    let result = null;
    parallelPaths.forEach(parallelPath => {
        // 构建矩形
        const tempRect = RectangleClient.toRectangleClient([pointOfInterSection, parallelPath[0], parallelPath[1]]);
        if (!RectangleClient.isHit(tempRect, sourceRectangle) && !RectangleClient.isHit(tempRect, targetRectangle)) {
            const getCornerCount = (path: Point[]) => {
                let cornerCount = 0;
                for (let index = 1; index < path.length - 1; index++) {
                    const pre = path[index - 1];
                    const current = path[index];
                    const next = path[index + 1];
                    if (
                        pre &&
                        current &&
                        next &&
                        !((current[0] === pre[0] && current[0] === next[0]) || (current[1] === pre[1] && current[1] === next[1]))
                    ) {
                        cornerCount++;
                    }
                }
                return cornerCount;
            };
            const tempCorners = RectangleClient.getCornerPoints(tempRect);
            const indexRangeInPath: number[] = [];
            const indexRangeInCorner: number[] = [];
            path.forEach((point, index) => {
                const cornerResult = tempCorners.findIndex(
                    corner => Math.floor(corner[0]) === Math.floor(point[0]) && Math.floor(corner[1]) === Math.floor(point[1])
                );
                if (cornerResult !== -1) {
                    indexRangeInPath.push(index);
                    indexRangeInCorner.push(cornerResult);
                }
            });
            const newPath = [...path];
            const missCorner = tempCorners.find((c, index) => !indexRangeInCorner.includes(index)) as Point;
            const removeLength = Math.abs(indexRangeInPath[0] - indexRangeInPath[indexRangeInPath.length - 1]) + 1;
            newPath.splice(indexRangeInPath[0] + 1, removeLength - 2, missCorner);
            const cornerCount = getCornerCount([...path]);
            const newCornerCount = getCornerCount([...newPath]);
            if (newCornerCount <= cornerCount) {
                result = newPath;
                return newPath;
            }
        }
        return null;
    });
    return result;
};

export const computeOuterRectangle = (rectangle: RectangleClient, offset: number[]) => {
    const leftTopPoint: Point = [rectangle.x - offset[3], rectangle.y - offset[0]];
    const rightBottomPoint: Point = [rectangle.x + rectangle.width + offset[1], rectangle.y + rectangle.height + offset[2]];
    return RectangleClient.toRectangleClient([leftTopPoint, rightBottomPoint]);
};

export const computeRectangleOffset = (sourceRectangle: RectangleClient, targetRectangle: RectangleClient) => {
    const defaultOffset = ELBOW_LINE_OFFSET;
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

export const getGraphPoints = (infos: Options) => {
    const { nextSourcePoint, nextTargetPoint, sourceOuterRectangle, targetOuterRectangle } = infos;
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
    x.push((rectanglesX[1] + rectanglesX[2]) / 2, nextSourcePoint[0], nextTargetPoint[0]);
    const rectanglesY = [
        sourceOuterRectangle.y,
        sourceOuterRectangle.y + sourceOuterRectangle.height,
        targetOuterRectangle.y,
        targetOuterRectangle.y + targetOuterRectangle.height
    ].sort((a, b) => a - b);
    y.push((rectanglesY[1] + rectanglesY[2]) / 2, nextSourcePoint[1], nextTargetPoint[1]);
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
    result = removeDuplicatePoints(result).filter(point => {
        const isInSource = isPointInRectangle(sourceOuterRectangle, point);
        const isInTarget = isPointInRectangle(targetOuterRectangle, point);
        return !isInSource && !isInTarget;
    });
    return result;
};

export const createGraph = (points: Point[]) => {
    const graph = new PointGraph();
    const Xs: number[] = [];
    const Ys: number[] = [];
    const connections: Point[][] = [];
    points.forEach(p => {
        const x = p[0],
            y = p[1];
        if (Xs.indexOf(x) < 0) Xs.push(x);
        if (Ys.indexOf(y) < 0) Ys.push(y);
        graph.add(p);
    });
    Xs.sort((a, b) => a - b);
    Ys.sort((a, b) => a - b);
    const inHotIndex = (p: Point): boolean => graph.has(p);
    for (let i = 0; i < Xs.length; i++) {
        for (let j = 0; j < Ys.length; j++) {
            const point: Point = [Xs[i], Ys[j]];
            if (!inHotIndex(point)) continue;
            if (i > 0) {
                const otherPoint: Point = [Xs[i - 1], Ys[j]];
                if (inHotIndex(otherPoint)) {
                    graph.connect(otherPoint, point);
                    graph.connect(point, otherPoint);
                    connections.push([point, otherPoint]);
                }
            }
            if (j > 0) {
                const otherPoint: Point = [Xs[i], Ys[j - 1]];
                if (inHotIndex(otherPoint)) {
                    graph.connect(otherPoint, point);
                    graph.connect(point, otherPoint);
                    connections.push([point, otherPoint]);
                }
            }
        }
    }
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
        this.list = this.list.sort((item1, item2) => item1.priority - item2.priority);
    }

    dequeue() {
        return this.list.shift();
    }
}

class AStar {
    constructor(private graph: PointGraph) {}

    heuristic(a: Point, b: Point) {
        return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    }

    search(start: Point, end: Point, source: Point) {
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
                const previousNode = cameFrom.get(current!.node);
                // 拐点权重
                const previousPoint = previousNode ? previousNode.data : source;
                const x = previousPoint[0] === current?.node.data[0] && previousPoint[0] === next.data[0];
                const y = previousPoint[1] === current?.node.data[1] && previousPoint[1] === next.data[1];
                if (!x && !y) {
                    newCost = newCost + 1;
                }
                if (!costSoFar.has(next) || (costSoFar.get(next) && newCost < costSoFar.get(next)!)) {
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

function getAdjustOptions(path: Point[], middle: number, isHorizon: boolean) {
    const parallelPaths: [Point, Point][] = [];
    let start: null | Point = null;
    let pointOfInterSection: null | Point = null;
    const axis = isHorizon ? 0 : 1;

    for (let index = 0; index < path.length; index++) {
        const previous = path[index - 1];
        const current = path[index];
        if (start === null && previous && previous[axis] === current[axis]) {
            start = previous;
        }
        if (start !== null) {
            if (previous[axis] !== current[axis]) {
                parallelPaths.push([start, previous]);
                start = null;
            }
        }
        if (current[axis] === middle) {
            pointOfInterSection = current;
        }
    }
    if (start) {
        parallelPaths.push([start, path[path.length - 1]]);
    }
    return { pointOfInterSection, parallelPaths };
}
