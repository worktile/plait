import { PlaitBoard, Point, RectangleClient, isLineHitLine } from '@plait/core';
import { removeDuplicatePoints } from './line';
import { PointGraph } from './Graph';

export const generatorElbowPoints = (infos: any) => {
    const points = getGraphPoints(infos);
    const graph = createGraph(infos.board, points);
    return points;
};

export const getGraphPoints = (infos: any) => {
    const { sourcePoint, sourceDirection, sourceRectangle, targetPoint, targetDirection, targetRectangle, offset, board } = infos;
    const sourceOuterRectangle = RectangleClient.inflate(sourceRectangle, 60);
    const targetOuterRectangle = RectangleClient.inflate(targetRectangle, 60);

    const outerRectangle = RectangleClient.toRectangleClient([
        ...RectangleClient.getCornerPoints(sourceOuterRectangle),
        ...RectangleClient.getCornerPoints(targetOuterRectangle)
    ]);
    const lineRectangle = RectangleClient.toRectangleClient([sourcePoint, targetPoint]);
    const x: number[] = [];
    const y: number[] = [];
    let result: Point[] = [];
    [sourceOuterRectangle, targetOuterRectangle, outerRectangle, lineRectangle].forEach(rectangle => {
        x.push(rectangle.x, rectangle.x + rectangle.width / 2, rectangle.x + rectangle.width);
        y.push(rectangle.y, rectangle.y + rectangle.height / 2, rectangle.y + rectangle.height);
    });
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

    // connections.forEach(linePoints => {
    //     const line = PlaitBoard.getRoughSVG(board).line(...linePoints[0], ...linePoints[1], {
    //         stroke: 'blue',
    //         strokeWidth: 1,
    //         fillStyle: 'solid'
    //     });
    //     PlaitBoard.getElementActiveHost(board).appendChild(line);
    // });

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
