import { PlaitBoard, Transforms, Point } from '@plait/core';
import { DefaultGeometryProperty } from '../constants';
import { GeometryShape, PlaitGeometry } from '../interfaces';
import { createGeometryElement } from '../utils';

export const insertGeometry = (board: PlaitBoard, points: [Point, Point], shape: GeometryShape) => {
    let newElement = createGeometryElement(shape, points, '', {
        strokeColor: DefaultGeometryProperty.strokeColor,
        strokeWidth: DefaultGeometryProperty.stokeWidth
    }) as PlaitGeometry;

    Transforms.insertNode(board, newElement, [board.children.length]);
};

export const insertText = (board: PlaitBoard, points: [Point, Point]) => {
    let newElement = createGeometryElement(GeometryShape.text, points, '文本') as PlaitGeometry;

    Transforms.insertNode(board, newElement, [board.children.length]);
};
