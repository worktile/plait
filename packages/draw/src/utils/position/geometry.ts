import { Ancestor, PlaitBoard, Point, RectangleClient, depthFirstRecursion, getIsRecursionFunc } from '@plait/core';
import { PlaitDrawElement, PlaitGeometry } from '../../interfaces';
import { RESIZE_HANDLE_DIAMETER, getRectangleByPoints, getRectangleResizeHandleRefs } from '@plait/common';

export const getHitGeometryResizeHandleRef = (board: PlaitBoard, element: PlaitGeometry, point: Point) => {
    const rectangle = getRectangleByPoints(element.points);
    const resizeHandleRefs = getRectangleResizeHandleRefs(rectangle, RESIZE_HANDLE_DIAMETER);
    const result = resizeHandleRefs.find(resizeHandleRef => {
        return RectangleClient.isHit(RectangleClient.toRectangleClient([point, point]), resizeHandleRef.rectangle);
    });
    return result;
};

export const getHitOutlineGeometry = (board: PlaitBoard, point: Point, offset: number = 0): PlaitGeometry | null => {
    let geometry: PlaitGeometry | null = null;
    depthFirstRecursion<Ancestor>(
        board,
        node => {
            if (PlaitDrawElement.isGeometry(node)) {
                let client = getRectangleByPoints(node.points);
                client = RectangleClient.getOutlineRectangle(client, offset);
                const rangeRectangle = RectangleClient.toRectangleClient([point, point]);
                if (RectangleClient.isHit(rangeRectangle, client)) {
                    geometry = node;
                }
            }
        },
        getIsRecursionFunc(board),
        true
    );
    return geometry;
};
