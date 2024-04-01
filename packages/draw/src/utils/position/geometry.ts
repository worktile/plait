import {
    Ancestor,
    PlaitBoard,
    Point,
    RectangleClient,
    depthFirstRecursion,
    getIsRecursionFunc,
    rotatePoints,
    rotateAntiPointsByElement
} from '@plait/core';
import { PlaitDrawElement, PlaitGeometry } from '../../interfaces';
import { RESIZE_HANDLE_DIAMETER, getRectangleResizeHandleRefs, getRotatedResizeCursorClassByAngle } from '@plait/common';
import { getEngine } from '../../engines';
import { PlaitImage } from '../../interfaces/image';
import { getShape } from '../shape';

export const getHitRectangleResizeHandleRef = (board: PlaitBoard, rectangle: RectangleClient, point: Point, angle: number = 0) => {
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

export const getHitOutlineGeometry = (board: PlaitBoard, point: Point, offset: number = 0): PlaitGeometry | null => {
    let geometry: PlaitGeometry | PlaitImage | null = null;
    depthFirstRecursion<Ancestor>(
        board,
        node => {
            if (PlaitDrawElement.isGeometry(node) || PlaitDrawElement.isImage(node)) {
                let client = RectangleClient.getRectangleByPoints(node.points);
                client = RectangleClient.getOutlineRectangle(client, offset);
                const shape = getShape(node);
                const isHit = getEngine(shape).isInsidePoint(client, rotateAntiPointsByElement(point, node) || point);
                if (isHit) {
                    geometry = node;
                }
            }
        },
        getIsRecursionFunc(board),
        true
    );
    return geometry;
};
