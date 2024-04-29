import {
    PlaitBoard,
    RectangleClient,
    Point,
    createG
} from '@plait/core';
import { Options } from 'roughjs/bin/core';
import { ShapeEngine } from '../../interfaces';

export const TableEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        // TODO: draw table
        const g = createG();
        return g;
    },
    isInsidePoint(rectangle: RectangleClient, point: Point) {
        return false;
    },
    getCornerPoints(rectangle: RectangleClient) {
        return RectangleClient.getCornerPoints(rectangle);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        return [0, 0];
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return [
            [0, 0],
            [0, 0]
        ];
    }
};
