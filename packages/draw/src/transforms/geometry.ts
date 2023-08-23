import { PlaitBoard, Transforms, Point, addSelectedElement, clearSelectedElement, Path } from '@plait/core';
import { DefaultGeometryProperty } from '../constants';
import { GeometryShape, PlaitGeometry } from '../interfaces';
import { createGeometryElement } from '../utils';
import { Element } from 'slate';
import { normalizeShapePoints } from '@plait/common';

export const insertGeometry = (board: PlaitBoard, points: [Point, Point], shape: GeometryShape) => {
    let newElement = createGeometryElement(shape, points, '', {
        strokeColor: DefaultGeometryProperty.strokeColor,
        strokeWidth: DefaultGeometryProperty.strokeWidth
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

export const resizeGeometry = (board: PlaitBoard, points: [Point, Point], path: Path) => {
    const normalizePoints = normalizeShapePoints(points);
    Transforms.setNode(board, { points: normalizePoints }, path);
};
