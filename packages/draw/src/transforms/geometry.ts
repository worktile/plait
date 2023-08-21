import { PlaitBoard, Transforms, Point, addSelectedElement, clearSelectedElement } from '@plait/core';
import { DefaultGeometryProperty } from '../constants';
import { GeometryShape, PlaitGeometry } from '../interfaces';
import { createGeometryElement } from '../utils';
import { Element } from 'slate';

export const insertGeometry = (board: PlaitBoard, points: [Point, Point], shape: GeometryShape) => {
    let newElement = createGeometryElement(shape, points, '', {
        strokeColor: DefaultGeometryProperty.strokeColor,
        strokeWidth: DefaultGeometryProperty.stokeWidth
    }) as PlaitGeometry;

    Transforms.insertNode(board, newElement, [board.children.length]);
    clearSelectedElement(board);
    addSelectedElement(board, newElement);
};

export const insertText = (board: PlaitBoard, points: [Point, Point], text: string | Element = '文本') => {
    let newElement = createGeometryElement(GeometryShape.text, points, text) as PlaitGeometry;
    Transforms.insertNode(board, newElement, [board.children.length]);
    clearSelectedElement(board);
    addSelectedElement(board, newElement);
};
