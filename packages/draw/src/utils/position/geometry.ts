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
import {
    RESIZE_HANDLE_DIAMETER,
    getRectangleResizeHandleRefs,
    getRotatedResizeCursorClassByAngle,
    ROTATE_HANDLE_SIZE,
    ROTATE_HANDLE_DISTANCE_TO_ELEMENT
} from '@plait/common';
import { PlaitDrawElement, PlaitGeometry, PlaitShapeElement } from '../../interfaces';
import { isHitEdgeOfShape, isInsideOfShape } from '../hit';
import { LINE_HIT_GEOMETRY_BUFFER, LINE_SNAPPING_BUFFER } from '../../constants/geometry';
import { getNearestPoint } from '../geometry';
import { getHitConnectorPoint } from '../line/line-basic';

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

export const getSnappingGeometry = (board: PlaitBoard, point: Point): PlaitGeometry | null => {
    let hitElement: PlaitShapeElement | null = getHitGeometry(board, point);
    if (hitElement) {
        const ref = getSnappingRef(board, hitElement, point);
        if (ref.isHitConnector || ref.isHitEdge) {
            return hitElement;
        }
    }
    return null;
};

export const getSnappingRef = (board: PlaitBoard, hitElement: PlaitShapeElement, point: Point) => {
    const rotatedPoint = rotateAntiPointsByElement(point, hitElement) || point;
    const connectorPoint = getHitConnectorPoint(rotatedPoint, hitElement);
    const edgePoint = getNearestPoint(hitElement, rotatedPoint);
    const isHitEdge = isHitEdgeOfShape(board, hitElement, rotatedPoint, LINE_SNAPPING_BUFFER);
    return { isHitEdge, isHitConnector: !!connectorPoint, connectorPoint, edgePoint };
};

export const getHitGeometry = (board: PlaitBoard, point: Point, offset = LINE_HIT_GEOMETRY_BUFFER): PlaitGeometry | null => {
    let hitShape: PlaitShapeElement | null = null;
    traverseDrawShapes(board, (element: PlaitShapeElement) => {
        if (hitShape === null && isInsideOfShape(board, element, rotateAntiPointsByElement(point, element) || point, offset * 2)) {
            hitShape = element;
        }
    });
    return hitShape;
};

export const traverseDrawShapes = (board: PlaitBoard, callback: (element: PlaitShapeElement) => void) => {
    depthFirstRecursion<Ancestor>(
        board,
        node => {
            if (!PlaitBoard.isBoard(node) && PlaitDrawElement.isShapeElement(node)) {
                callback(node);
            }
        },
        getIsRecursionFunc(board),
        true
    );
};

export const getRotateHandleRectangle = (rectangle: RectangleClient) => {
    return {
        x: rectangle.x - ROTATE_HANDLE_DISTANCE_TO_ELEMENT - ROTATE_HANDLE_SIZE,
        y: rectangle.y + rectangle.height + ROTATE_HANDLE_DISTANCE_TO_ELEMENT,
        width: ROTATE_HANDLE_SIZE,
        height: ROTATE_HANDLE_SIZE
    };
};
