import {
    Ancestor,
    PlaitBoard,
    Point,
    RectangleClient,
    depthFirstRecursion,
    getIsRecursionFunc,
    isPointInPolygon,
    isPointInEllipse,
    isPointInRoundRectangle
} from '@plait/core';
import { GeometryShape, PlaitDrawElement, PlaitGeometry } from '../../interfaces';
import { RESIZE_HANDLE_DIAMETER, getRectangleByPoints, getRectangleResizeHandleRefs } from '@plait/common';
import { getRoundRectangleRadius } from '../geometry';

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
                const shape = node.shape;
                let client = getRectangleByPoints(node.points);
                client = RectangleClient.getOutlineRectangle(client, offset);
                const rangeRectangle = RectangleClient.toRectangleClient([point, point]);
                switch (shape) {
                    case GeometryShape.rectangle:
                        if (RectangleClient.isHit(rangeRectangle, client)) {
                            geometry = node;
                        }
                        break;
                    case GeometryShape.diamond:
                        const controlPoints = RectangleClient.getEdgeCenterPoints(client);
                        if (isPointInPolygon(point, controlPoints)) {
                            geometry = node;
                        }
                        break;
                    case GeometryShape.ellipse:
                        const centerPoint: Point = [client.x + client.width / 2, client.y + client.height / 2];
                        if (isPointInEllipse(point, centerPoint, client.width / 2, client.height / 2)) {
                            geometry = node;
                        }
                        break;
                    case GeometryShape.roundRectangle:
                        if (isPointInRoundRectangle(point, client, getRoundRectangleRadius(client))) {
                            geometry = node;
                        }
                        break;
                }
            }
        },
        getIsRecursionFunc(board),
        true
    );
    return geometry;
};
