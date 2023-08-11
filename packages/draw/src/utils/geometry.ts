import { PlaitBoard, Point, idCreator } from '@plait/core';
import { GeometryShape, PlaitGeometry } from '../interfaces/geometry';
import { DrawPointerType } from '../constants';

export const createGeometryElement = (
    shape: GeometryShape,
    points: [Point, Point],
    text?: string,
    options?: Pick<PlaitGeometry, 'fill' | 'strokeColor' | 'strokeWidth'>
) => {
    return {
        id: idCreator(),
        type: 'geometry',
        shape,
        angle: 0,
        opacity: 1,
        text: { children: [{ text }] },
        points,
        ...options
    };
};

export const getPointsByCenterPoint = (point: Point, width: number, height: number): [Point, Point] => {
    const leftTopPoint: Point = [point[0] - width / 2, point[1] - height / 2];
    const rightBottomPoint: Point = [point[0] + width / 2, point[1] + height / 2];

    return [leftTopPoint, rightBottomPoint];
};

// export const getIsGeometryPointer = (board: PlaitBoard) => {
//     const pointer = PlaitBoard.getPointer(board) as DrawPointerType;
//     const geometryPointer = [DrawPointerType.rectangle, DrawPointerType.text];
//     return geometryPointer.includes(pointer);
// };
