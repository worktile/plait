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
    let angle = elements[0].angle || 0;
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

export const resizeSelectionRectangle = (rectanglesCornerPoints: [Point, Point, Point, Point][], angle: number) => {
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
