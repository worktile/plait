import { PlaitElement, Point, RectangleClient } from '../interfaces';
import { approximately, rotate } from './math';

export const rotatePoints = (points: Point[], centerPoint: Point, angle: number) => {
    if (!angle) {
        angle = 0;
    }
    return points.map(point => {
        return rotate(point[0], point[1], centerPoint[0], centerPoint[1], angle) as Point;
    });
};

export const getSelectionAngle = (elements: PlaitElement[]) => {
    let angle = elements[0]?.angle || 0;
    elements.forEach(item => {
        if (item.angle !== angle && !approximately((item.angle % (Math.PI / 2)) - (angle % (Math.PI / 2)), 0)) {
            angle = 0;
        }
    });
    return angle;
};

export const hasSameAngle = (elements: PlaitElement[]) => {
    return !!getSelectionAngle(elements);
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
