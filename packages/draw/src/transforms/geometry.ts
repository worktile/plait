import { PlaitBoard, Transforms, Point, Path, PlaitNode, getSelectedElements } from '@plait/core';
import { PlaitDrawElement, GeometryShapes, PlaitText, BasicShapes, PlaitArrowLine } from '../interfaces';
import {
    collectArrowLineUpdatedRefsByGeometry,
    createDefaultGeometry,
    createTextElement,
    getMemorizedLatestByPointer,
    getTextShapeProperty,
    insertElement
} from '../utils';
import { Element } from 'slate';
import { normalizeShapePoints } from '@plait/common';
import { DrawTransforms } from '.';

export const insertGeometry = (board: PlaitBoard, points: [Point, Point], shape: GeometryShapes) => {
    const newElement = createDefaultGeometry(board, points, shape);
    insertElement(board, newElement);
    return newElement;
};

export const insertText = (board: PlaitBoard, point: Point, text: string | Element) => {
    const memorizedLatest = getMemorizedLatestByPointer(BasicShapes.text);
    const property = getTextShapeProperty(board, text, memorizedLatest.textProperties['font-size']);
    const points: [Point, Point] = [point, [point[0] + property.width, point[1] + property.height]];
    const newElement = createTextElement(board, points, text);
    insertElement(board, newElement);
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

export const switchGeometryShape = (board: PlaitBoard, shape: GeometryShapes) => {
    const selectedElements = getSelectedElements(board);
    const refs: { property: Partial<PlaitArrowLine>; path: Path }[] = [];
    selectedElements.forEach(item => {
        if (PlaitDrawElement.isGeometry(item) && !PlaitDrawElement.isText(item)) {
            const path = PlaitBoard.findPath(board, item);
            Transforms.setNode(board, { shape }, path);
            collectArrowLineUpdatedRefsByGeometry(board, { ...item, shape }, refs);
        }
    });
    if (refs.length) {
        refs.forEach(ref => {
            DrawTransforms.resizeArrowLine(board, ref.property, ref.path);
        });
    }
};
