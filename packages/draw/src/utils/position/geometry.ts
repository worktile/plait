import { PlaitBoard, Point, RectangleClient } from '@plait/core';
import { PlaitGeometry } from '../../interfaces';
import { RESIZE_HANDLE_DIAMETER, getRectangleByPoints, getRectangleResizeTargets } from '@plait/common';

export const getHitGeometryResizeHandleRef = (board: PlaitBoard, element: PlaitGeometry, point: Point) => {
    const rectangle = getRectangleByPoints(element.points);
    const resizeTargets = getRectangleResizeTargets(rectangle, RESIZE_HANDLE_DIAMETER);
    const result = resizeTargets.find(resizeTarget => {
        return RectangleClient.isHit(RectangleClient.toRectangleClient([point, point]), resizeTarget.rectangle);
    });
    return result;
};
