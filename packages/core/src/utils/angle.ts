import { PlaitBoard, PlaitElement, Point, RectangleClient } from '../interfaces';
import { Transforms } from '../transforms';
import { getRectangleByElements } from './element';
import { approximately, rotate } from './math';

export const rotatePoints = <T>(points: T, centerPoint: Point, angle?: number): T => {
    if (!angle) {
        angle = 0;
    }
    if (Array.isArray(points) && typeof points[0] === 'number') {
        return rotate(points[0], points[1], centerPoint[0], centerPoint[1], angle) as T;
    } else {
        return (points as Point[]).map(point => {
            return rotate(point[0], point[1], centerPoint[0], centerPoint[1], angle || 0);
        }) as T;
    }
};

export const getSelectionAngle = (elements: PlaitElement[]) => {
    let angle = elements[0]?.angle || 0;
    elements.forEach(item => {
        if (item.angle !== angle && !approximately(((item.angle || 0) % (Math.PI / 2)) - (angle % (Math.PI / 2)), 0)) {
            angle = 0;
        }
    });
    return angle;
};

export const hasSameAngle = (elements: PlaitElement[]) => {
    if (!elements.length) {
        return false;
    }

    const angle = elements[0].angle;
    if (angle === undefined) {
        return false;
    }

    return !elements.some(item => item.angle !== angle);
};

export const getRotatedBoundingRectangle = (rectanglesCornerPoints: [Point, Point, Point, Point][], angle: number) => {
    let rectanglesFromOrigin: RectangleClient[] = [];
    for (let i = 0; i < rectanglesCornerPoints.length; i++) {
        const cornerPoints = rectanglesCornerPoints[i];
        const invertCornerPointsFromOrigin = rotatePoints(cornerPoints, [0, 0], -angle);
        rectanglesFromOrigin.push(RectangleClient.getRectangleByPoints(invertCornerPointsFromOrigin));
    }

    const selectionRectangleFromOrigin = RectangleClient.getBoundingRectangle(rectanglesFromOrigin);
    const selectionCornerPoints = RectangleClient.getCornerPoints(selectionRectangleFromOrigin);
    const cornerPointsFromOrigin = rotatePoints(selectionCornerPoints, [0, 0], angle);
    const centerPoint = RectangleClient.getCenterPoint(RectangleClient.getRectangleByPoints(cornerPointsFromOrigin));
    return RectangleClient.getRectangleByPoints(rotatePoints(cornerPointsFromOrigin, centerPoint, -angle));
};

export const getOffsetAfterRotate = (rectangle: RectangleClient, rotateCenterPoint: Point, angle: number) => {
    const targetCenterPoint = RectangleClient.getCenterPoint(rectangle);
    const [rotatedCenterPoint] = rotatePoints([targetCenterPoint], rotateCenterPoint, angle);
    const offsetX = rotatedCenterPoint[0] - targetCenterPoint[0];
    const offsetY = rotatedCenterPoint[1] - targetCenterPoint[1];
    return { offsetX, offsetY };
};

export const rotatedDataPoints = (points: Point[], rotateCenterPoint: Point, angle: number): Point[] => {
    const { offsetX, offsetY } = getOffsetAfterRotate(RectangleClient.getRectangleByPoints(points), rotateCenterPoint, angle);
    return points.map(p => [p[0] + offsetX, p[1] + offsetY]) as Point[];
};

export const hasValidAngle = (node: PlaitElement) => {
    return node.angle && node.angle !== 0;
};

export const rotatePointsByElement = <T>(points: T, element: PlaitElement): T | null => {
    if (hasValidAngle(element)) {
        let rectangle = RectangleClient.getRectangleByPoints(element.points!);
        const centerPoint = RectangleClient.getCenterPoint(rectangle);
        return rotatePoints(points, centerPoint, element.angle);
    } else {
        return null;
    }
};

export const rotateAntiPointsByElement = <T>(points: T, element: PlaitElement): T | null => {
    if (hasValidAngle(element)) {
        let rectangle = RectangleClient.getRectangleByPoints(element.points!);
        const centerPoint = RectangleClient.getCenterPoint(rectangle);
        return rotatePoints(points, centerPoint, element.angle ? -element.angle : 0);
    } else {
        return null;
    }
};

export const getRectangleByAngle = (rectangle: RectangleClient, angle: number) => {
    if (angle) {
        const cornerPoints = RectangleClient.getCornerPoints(rectangle);
        const centerPoint = RectangleClient.getCenterPoint(rectangle);
        return RectangleClient.getRectangleByPoints(rotatePoints(cornerPoints, centerPoint, angle));
    }
    return rectangle;
};

export const isAxisChangedByAngle = (angle: number) => {
    const unitAngle = Math.abs(angle) % Math.PI;
    return unitAngle >= (1 / 4) * Math.PI && unitAngle <= (3 / 4) * Math.PI;
};

export function degreesToRadians(d: number): number {
    return (d / 180) * Math.PI;
}

export function radiansToDegrees(r: number): number {
    return (r / Math.PI) * 180;
}

export function rotateElements(board: PlaitBoard, elements: PlaitElement[], angle: number) {
    const selectionRectangle = getRectangleByElements(board, elements, false);
    const selectionCenterPoint = RectangleClient.getCenterPoint(selectionRectangle);
    elements.forEach(item => {
        const originAngle = item.angle;
        const points = rotatedDataPoints(item.points!, selectionCenterPoint, normalizeAngle(angle));
        const path = PlaitBoard.findPath(board, item);
        Transforms.setNode(board, { points, angle: normalizeAngle((originAngle || 0) + angle) }, path);
    });
}

export const normalizeAngle = (angle: number): number => {
    if (angle < 0) {
        return angle + 2 * Math.PI;
    }
    if (angle >= 2 * Math.PI) {
        return angle - 2 * Math.PI;
    }
    return angle;
};

export const getAngleBetweenPoints = (startPoint: Point, endPoint: Point, centerPoint: Point): number => {
    const startAngle = (5 * Math.PI) / 2 + Math.atan2(startPoint[1] - centerPoint[1], startPoint[0] - centerPoint[0]);
    const endAngle = (5 * Math.PI) / 2 + Math.atan2(endPoint[1] - centerPoint[1], endPoint[0] - centerPoint[0]);
    return normalizeAngle(endAngle - startAngle);
};

export const getAngleByElement = (element: PlaitElement): number | undefined => {
    return element?.angle;
};

export const setAngleForG = (g: SVGGElement, centerPoint: Point, angle: number) => {
    if (angle === 0) {
        g.removeAttribute('transform');
        return;
    }
    var centerX = centerPoint[0];
    var centerY = centerPoint[1];

    let cosTheta = Math.cos(angle);
    let sinTheta = Math.sin(angle);

    let transformMatrix = [
        cosTheta,
        sinTheta,
        -sinTheta,
        cosTheta,
        centerX * (1 - cosTheta) + centerY * sinTheta,
        centerY * (1 - cosTheta) - centerX * sinTheta
    ];

    let matrix = 'matrix(' + transformMatrix.join(',') + ')';
    g.setAttribute('transform', `${matrix}`);
};
