import { Direction, Point, RectangleClient, downScale } from '@plait/core';
import { removeDuplicatePoints } from '../utils';
import { DEFAULT_ROUTE_MARGIN } from '../constants';
import { AStar, PointGraph } from '../algorithms';

export interface ElbowLineRouteOptions {
    sourcePoint: Point;
    nextSourcePoint: Point;
    sourceRectangle: RectangleClient;
    sourceOuterRectangle: RectangleClient;
    targetPoint: Point;
    nextTargetPoint: Point;
    targetOuterRectangle: RectangleClient;
    targetRectangle: RectangleClient;
}

export interface RouteAdjustOptions {
    xAxis?: number;
    yAxis?: number;
    sourceRectangle: RectangleClient;
    targetRectangle: RectangleClient;
}

export interface AdjustOptions {
    parallelPaths: [Point, Point][];
    pointOfHit: Point;
    sourceRectangle: RectangleClient;
    targetRectangle: RectangleClient;
}

export const generateElbowLineRoute = (options: ElbowLineRouteOptions) => {
    const { nextSourcePoint, nextTargetPoint } = options;
    const points = getGraphPoints(options);
    const graph = createGraph(points);
    const aStar = new AStar(graph);
    aStar.search(nextSourcePoint, nextTargetPoint, options.sourcePoint);
    let route = aStar.getRoute(nextSourcePoint, nextTargetPoint);
    route = [options.sourcePoint, ...route, nextTargetPoint, options.targetPoint];
    const isHitX = RectangleClient.isHitX(options.sourceOuterRectangle, options.targetOuterRectangle);
    const isHitY = RectangleClient.isHitY(options.sourceOuterRectangle, options.targetOuterRectangle);
    const xAxis = isHitX ? undefined : RectangleClient.getGapCenter(options.sourceOuterRectangle, options.targetOuterRectangle, false);
    const yAxis = isHitY ? undefined : RectangleClient.getGapCenter(options.sourceOuterRectangle, options.targetOuterRectangle, true);
    route = routeAdjust(route, { xAxis, yAxis, sourceRectangle: options.sourceRectangle, targetRectangle: options.targetRectangle });
    return route;
};

const routeAdjust = (path: Point[], options: RouteAdjustOptions) => {
    // 基于 middleX/middleY 中线纠正 path
    // 1. 找垂直/水平的线段
    // 2. 找到和middleX/middleY相交的点
    // 3. 基于垂直/水平的线段分别和相交点构建矩形
    // 4. 判断矩形相交
    // 5. 处理 path
    const { sourceRectangle, targetRectangle, xAxis, yAxis } = options;
    if (xAxis !== undefined) {
        const optionsX = getAdjustOptions(path, xAxis, true);
        const resultX =
            optionsX.pointOfHit &&
            adjust(path, { parallelPaths: optionsX.parallelPaths, pointOfHit: optionsX.pointOfHit, sourceRectangle, targetRectangle });
        if (resultX) {
            path = resultX;
        }
    }
    if (yAxis !== undefined) {
        const optionsY = getAdjustOptions(path, yAxis, false);
        const resultY =
            optionsY.pointOfHit &&
            adjust(path, { parallelPaths: optionsY.parallelPaths, pointOfHit: optionsY.pointOfHit, sourceRectangle, targetRectangle });
        if (resultY) {
            path = resultY;
        }
    }
    return path;
};

const adjust = (route: Point[], options: AdjustOptions) => {
    const { parallelPaths, pointOfHit, sourceRectangle, targetRectangle } = options;
    let result = null;
    parallelPaths.forEach(parallelPath => {
        // 构建矩形
        const tempRect = RectangleClient.toRectangleClient([pointOfHit, parallelPath[0], parallelPath[1]]);
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
                        !(
                            (downScale(current[0]) === downScale(pre[0]) && downScale(current[0]) === downScale(next[0])) ||
                            (downScale(current[1]) === downScale(pre[1]) && downScale(current[1]) === downScale(next[1]))
                        )
                    ) {
                        cornerCount++;
                    }
                }
                return cornerCount;
            };
            const tempCorners = RectangleClient.getCornerPoints(tempRect);
            const indexRangeInPath: number[] = [];
            const indexRangeInCorner: number[] = [];
            route.forEach((point, index) => {
                const cornerResult = tempCorners.findIndex(
                    corner => Math.floor(corner[0]) === Math.floor(point[0]) && Math.floor(corner[1]) === Math.floor(point[1])
                );
                if (cornerResult !== -1) {
                    indexRangeInPath.push(index);
                    indexRangeInCorner.push(cornerResult);
                }
            });
            const newPath = [...route];
            const missCorner = tempCorners.find((c, index) => !indexRangeInCorner.includes(index)) as Point;
            const removeLength = Math.abs(indexRangeInPath[0] - indexRangeInPath[indexRangeInPath.length - 1]) + 1;
            newPath.splice(indexRangeInPath[0] + 1, removeLength - 2, missCorner);
            const cornerCount = getCornerCount([...route]);
            const newCornerCount = getCornerCount([...newPath]);
            if (newCornerCount <= cornerCount) {
                result = newPath;
            }
        }
        return null;
    });
    return result;
};

const getAdjustOptions = (path: Point[], middle: number, isHorizontal: boolean) => {
    const parallelPaths: [Point, Point][] = [];
    let start: null | Point = null;
    let pointOfHit: null | Point = null;
    const axis = isHorizontal ? 0 : 1;

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
            pointOfHit = current;
        }
    }
    if (start) {
        parallelPaths.push([start, path[path.length - 1]]);
    }
    return { pointOfHit, parallelPaths };
};

export const getGraphPoints = (options: ElbowLineRouteOptions) => {
    const { nextSourcePoint, nextTargetPoint, sourceOuterRectangle, targetOuterRectangle } = options;
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
            const isInSource = RectangleClient.isPointInRectangle(sourceOuterRectangle, point);
            const isInTarget = RectangleClient.isPointInRectangle(targetOuterRectangle, point);
            if (!isInSource && !isInTarget) {
                result.push(point);
            }
        }
    }
    result = removeDuplicatePoints(result).filter(point => {
        const isInSource = RectangleClient.isPointInRectangle(sourceOuterRectangle, point);
        const isInTarget = RectangleClient.isPointInRectangle(targetOuterRectangle, point);
        return !isInSource && !isInTarget;
    });
    return result;
};

export const createGraph = (points: Point[]) => {
    const graph = new PointGraph();
    const Xs: number[] = [];
    const Ys: number[] = [];
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
                }
            }
            if (j > 0) {
                const otherPoint: Point = [Xs[i], Ys[j - 1]];
                if (inHotIndex(otherPoint)) {
                    graph.connect(otherPoint, point);
                    graph.connect(point, otherPoint);
                }
            }
        }
    }
    return graph;
};

export const reduceRouteMargin = (sourceRectangle: RectangleClient, targetRectangle: RectangleClient) => {
    const defaultOffset = DEFAULT_ROUTE_MARGIN;
    let sourceOffset: number[] = new Array(4).fill(defaultOffset);
    let targetOffset: number[] = new Array(4).fill(defaultOffset);
    const sourceOuterRectangle = RectangleClient.inflate(sourceRectangle, defaultOffset * 2);
    const targetOuterRectangle = RectangleClient.inflate(targetRectangle, defaultOffset * 2);
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
