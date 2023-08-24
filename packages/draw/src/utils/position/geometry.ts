import { PlaitBoard, Point, RectangleClient } from '@plait/core';
import { PlaitGeometry } from '../../interfaces';
import { RESIZE_HANDLE_DIAMETER, getRectangleByPoints, getRectangleResizeHandleRefs } from '@plait/common';

export const getHitGeometryResizeHandleRef = (board: PlaitBoard, element: PlaitGeometry, point: Point) => {
    const rectangle = getRectangleByPoints(element.points);
    const resizeHandleRefs = getRectangleResizeHandleRefs(rectangle, RESIZE_HANDLE_DIAMETER);
    const result = resizeHandleRefs.find(resizeHandleRef => {
        return RectangleClient.isHit(RectangleClient.toRectangleClient([point, point]), resizeHandleRef.rectangle);
    });
    return result;
};
