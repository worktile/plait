import { Direction, PlaitBoard, Point, RectangleClient, createDebugGenerator, DebugGenerator } from '@plait/core';
import { removeDuplicatePoints, simplifyOrthogonalPoints } from '../utils';
import { DEFAULT_ROUTE_MARGIN } from '../constants';
import { AStar, PointGraph } from '../algorithms';

const debugGenerator = createDebugGenerator('debug:plait:elbow-line-routing');

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
    centerX?: number;
    centerY?: number;
    sourceRectangle: RectangleClient;
    targetRectangle: RectangleClient;
}

export interface AdjustOptions {
    parallelPaths: [Point, Point][];
    pointOfHit: Point;
    sourceRectangle: RectangleClient;
    targetRectangle: RectangleClient;
}

export const generateElbowLineRoute = (options: ElbowLineRouteOptions, board?: PlaitBoard) => {
    const { nextSourcePoint, nextTargetPoint } = options;
    const points = getGraphPoints(options);
    const graph = createGraph(points);
    const aStar = new AStar(graph);
    aStar.search(nextSourcePoint, nextTargetPoint, options.sourcePoint);
    let route = aStar.getRoute(nextSourcePoint, nextTargetPoint);
    route = [options.sourcePoint, ...route, nextTargetPoint, options.targetPoint];
    // Centerline correction: Correct the shortest path route based on the horizontal centerline/vertical centerline
    // 1. Find the horizontal center line (centerX)/vertical center line (centerY)
    // 2. Find the point that intersects centerX/centerY in route, and find the line segment parallel to centerX/centerY in route
    // 3. Construct a rectangle based on the intersection points and parallel lines found in the previous step.
    // 4. Determine whether the rectangle intersects with the element. If it does not intersect, the center line can be mapped based on the rectangle constructed in the previous step.
    // 5. Determine whether the path after mapping the center line meets the constraints (inflection point cannot be increased)
    const isHitX = RectangleClient.isHitX(options.sourceOuterRectangle, options.targetOuterRectangle);
    const isHitY = RectangleClient.isHitY(options.sourceOuterRectangle, options.targetOuterRectangle);
    const centerX = isHitX ? undefined : RectangleClient.getGapCenter(options.sourceOuterRectangle, options.targetOuterRectangle, true);
    const centerY = isHitY ? undefined : RectangleClient.getGapCenter(options.sourceOuterRectangle, options.targetOuterRectangle, false);
    route = routeAdjust(route, { centerX, centerY, sourceRectangle: options.sourceRectangle, targetRectangle: options.targetRectangle }, board);
    return route;
};

export const routeAdjust = (path: Point[], options: RouteAdjustOptions, board?: PlaitBoard) => {
    const { sourceRectangle, targetRectangle, centerX, centerY } = options;
    if (board) {
        debugGenerator.clear();
    }
    if (centerX !== undefined) {
        const optionsX = getAdjustOptions(path, centerX, true);
        const resultX =
            optionsX.pointOfHit &&
            adjust(path, { parallelPaths: optionsX.parallelPaths, pointOfHit: optionsX.pointOfHit, sourceRectangle, targetRectangle }, board);
        if (resultX) {
            path = resultX;
        }
    }
    if (centerY !== undefined) {
        const optionsY = getAdjustOptions(path, centerY, false);
        const resultY =
            optionsY.pointOfHit &&
            adjust(path, { parallelPaths: optionsY.parallelPaths, pointOfHit: optionsY.pointOfHit, sourceRectangle, targetRectangle },  board);
        if (resultY) {
            path = resultY;
        }
    }
    return path;
};

const adjust = (route: Point[], options: AdjustOptions, board?: PlaitBoard): null | Point[] => {
    const { parallelPaths, pointOfHit, sourceRectangle, targetRectangle } = options;
    let result = null;
    parallelPaths.forEach(parallelPath => {
        // Construct a rectangle
        const tempRectPoints = [pointOfHit, parallelPath[0], parallelPath[1]];
        // directly use getCornerPoints will bring the precision issue (eg: 263.6923375175286 - 57.130859375)
        const tempRect = RectangleClient.getRectangleByPoints(tempRectPoints);
        if (!RectangleClient.isHit(tempRect, sourceRectangle) && !RectangleClient.isHit(tempRect, targetRectangle)) {
            const tempCorners = RectangleClient.getCornerPointsByPoints(tempRectPoints);
            if (board) {
                debugGenerator.drawRectangle(board, tempRect);
            }
            const indexRangeInPath: number[] = [];
            const indexRangeInCorner: number[] = [];
            route.forEach((point, index) => {
                const cornerResult = tempCorners.findIndex(corner => Point.isEquals(point, corner));
                if (cornerResult !== -1) {
                    indexRangeInPath.push(index);
                    indexRangeInCorner.push(cornerResult);
                }
            });
            const newPath = [...route];
            const missCorner = tempCorners.find((c, index) => !indexRangeInCorner.includes(index)) as Point;
            const removeLength = Math.abs(indexRangeInPath[0] - indexRangeInPath[indexRangeInPath.length - 1]) + 1;
            newPath.splice(indexRangeInPath[0] + 1, removeLength - 2, missCorner);
            const turnCount = simplifyOrthogonalPoints([...route]).length - 1;
            const simplifyPoints = simplifyOrthogonalPoints([...newPath]);
            // if (board) {
            //     debugGenerator.drawLine(board, simplifyPoints);
            // }
            const newTurnCount = simplifyPoints.length - 1;
            if (newTurnCount <= turnCount) {
                result = newPath;
            }
        }
        return null;
    });
    return result;
};

const getAdjustOptions = (path: Point[], centerOfAxis: number, isHorizontal: boolean) => {
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
        if (current[axis] === centerOfAxis) {
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

export const getSourceAndTargetOuterRectangle = (sourceRectangle: RectangleClient, targetRectangle: RectangleClient) => {
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
    return {
        sourceOuterRectangle,
        targetOuterRectangle
    };
};

export const isSourceAndTargetIntersect = (options: ElbowLineRouteOptions) => {
    const {
        sourcePoint,
        nextSourcePoint,
        sourceRectangle,
        sourceOuterRectangle,
        targetPoint,
        nextTargetPoint,
        targetRectangle,
        targetOuterRectangle
    } = options;

    return (
        RectangleClient.isPointInRectangle(targetRectangle, sourcePoint) ||
        RectangleClient.isPointInRectangle(targetOuterRectangle, nextSourcePoint) ||
        RectangleClient.isPointInRectangle(sourceOuterRectangle, nextTargetPoint) ||
        RectangleClient.isPointInRectangle(sourceRectangle, targetPoint)
    );
};
