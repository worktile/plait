import {
    Ancestor,
    PlaitBoard,
    Point,
    RectangleClient,
    depthFirstRecursion,
    getIsRecursionFunc,
    rotatePoints,
    rotateAntiPointsByElement,
    ResizeCursorClass
} from '@plait/core';
import {
    RESIZE_HANDLE_DIAMETER,
    getRectangleResizeHandleRefs,
    getRotatedResizeCursorClassByAngle,
    ROTATE_HANDLE_SIZE,
    ROTATE_HANDLE_DISTANCE_TO_ELEMENT,
    ResizeHandle
} from '@plait/common';
import { PlaitDrawElement, PlaitGeometry, PlaitShapeElement } from '../../interfaces';
import { isHitEdgeOfShape, isInsideOfShape } from '../hit';
import { LINE_HIT_GEOMETRY_BUFFER, LINE_SNAPPING_BUFFER } from '../../constants/geometry';
import { getNearestPoint } from '../geometry';
import { getHitConnectorPoint } from '../line/line-basic';
import { getHitShape } from '../common';

export interface ResizeHandleRef {
    rectangle: RectangleClient;
    handle: ResizeHandle;
    cursorClass: ResizeCursorClass;
}

export const getHitRectangleResizeHandleRef = (
    board: PlaitBoard,
    rectangle: RectangleClient,
    point: Point,
    angle: number = 0
): ResizeHandleRef | undefined => {
    const centerPoint = RectangleClient.getCenterPoint(rectangle);
    const resizeHandleRefs = getRectangleResizeHandleRefs(rectangle, RESIZE_HANDLE_DIAMETER);
    if (angle) {
        const rotatedPoint = rotatePoints([point], centerPoint, -angle)[0];
        let result = resizeHandleRefs.find(resizeHandleRef => {
            return RectangleClient.isHit(RectangleClient.getRectangleByPoints([rotatedPoint, rotatedPoint]), resizeHandleRef.rectangle);
        });
        if (result) {
            result.cursorClass = getRotatedResizeCursorClassByAngle(result.cursorClass, angle);
        }
        return result;
    } else {
        return resizeHandleRefs.find(resizeHandleRef => {
            return RectangleClient.isHit(RectangleClient.getRectangleByPoints([point, point]), resizeHandleRef.rectangle);
        });
    }
};

export const getRotateHandleRectangle = (rectangle: RectangleClient) => {
    return {
        x: rectangle.x - ROTATE_HANDLE_DISTANCE_TO_ELEMENT - ROTATE_HANDLE_SIZE,
        y: rectangle.y + rectangle.height + ROTATE_HANDLE_DISTANCE_TO_ELEMENT,
        width: ROTATE_HANDLE_SIZE,
        height: ROTATE_HANDLE_SIZE
    };
};
