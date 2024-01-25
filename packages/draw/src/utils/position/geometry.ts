import { Ancestor, PlaitBoard, Point, RectangleClient, depthFirstRecursion, getIsRecursionFunc } from '@plait/core';
import { PlaitDrawElement, PlaitGeometry } from '../../interfaces';
import { RESIZE_HANDLE_DIAMETER, getRectangleByPoints, getRectangleResizeHandleRefs, ResizeHandle } from '@plait/common';
import { getEngine } from '../../engines';
import { PlaitImage } from '../../interfaces/image';
import { getShape } from '../shape';

export const getHitRectangleResizeHandleRef = (board: PlaitBoard, rectangle: RectangleClient, point: Point) => {
    const resizeHandleRefs = getRectangleResizeHandleRefs(rectangle, RESIZE_HANDLE_DIAMETER);
    const result = resizeHandleRefs.find(resizeHandleRef => {
        return RectangleClient.isHit(RectangleClient.toRectangleClient([point, point]), resizeHandleRef.rectangle);
    });
    return result;
};

export const getHitOutlineGeometry = (board: PlaitBoard, point: Point, offset: number = 0): PlaitGeometry | null => {
    let geometry: PlaitGeometry | PlaitImage | null = null;
    depthFirstRecursion<Ancestor>(
        board,
        node => {
            if (PlaitDrawElement.isGeometry(node) || PlaitDrawElement.isImage(node)) {
                let client = getRectangleByPoints(node.points);
                client = RectangleClient.getOutlineRectangle(client, offset);
                const shape = getShape(node);
                const isHit = getEngine(shape).isHit(client, point);
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
