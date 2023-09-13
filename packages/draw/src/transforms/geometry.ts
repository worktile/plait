import { PlaitBoard, Transforms, Point, addSelectedElement, clearSelectedElement, Path, PlaitNode } from '@plait/core';
import { DefaultGeometryProperty } from '../constants';
import { GeometryShape, PlaitDrawElement, PlaitGeometry, PlaitText } from '../interfaces';
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

export const resizeGeometry = (board: PlaitBoard, points: [Point, Point], textHeight: number, path: Path) => {
    const normalizePoints = normalizeShapePoints(points);
    const element = PlaitNode.get(board, path);
    const newHeight = textHeight / board.viewport.zoom;
    const newProperties = { points: normalizePoints, textHeight: newHeight };
    if (PlaitDrawElement.isText(element) && element.autoSize) {
        (newProperties as Partial<PlaitText>).autoSize = false;
    }
    Transforms.setNode(board, newProperties, path);
};
