import {
    Ancestor,
    PlaitBoard,
    Point,
    RectangleClient,
    depthFirstRecursion,
    getIsRecursionFunc,
    rotatePoints,
    hasValidAngle
} from '@plait/core';
import { PlaitDrawElement, PlaitGeometry } from '../../interfaces';
import { RESIZE_HANDLE_DIAMETER, getRectangleResizeHandleRefs } from '@plait/common';
import { getEngine } from '../../engines';
import { PlaitImage } from '../../interfaces/image';
import { getShape } from '../shape';

export const getHitRectangleResizeHandleRef = (board: PlaitBoard, rectangle: RectangleClient, point: Point, angle: number = 0) => {
    const centerPoint = RectangleClient.getCenterPoint(rectangle);
    const rotatedPoint = rotatePoints([point], centerPoint, -angle)[0];
    const resizeHandleRefs = getRectangleResizeHandleRefs(rectangle, RESIZE_HANDLE_DIAMETER, angle);
    const result = resizeHandleRefs.find(resizeHandleRef => {
        return RectangleClient.isHit(RectangleClient.getRectangleByPoints([rotatedPoint, rotatedPoint]), resizeHandleRef.rectangle);
    });
    return result;
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

                let isHit;
                if (hasValidAngle(node)) {
                    const rotatedPoint = rotatePoints(point, RectangleClient.getCenterPoint(client), -node.angle);
                    isHit = getEngine(shape).isInsidePoint(client, rotatedPoint);
                } else {
                    isHit = getEngine(shape).isInsidePoint(client, point);
                }
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
