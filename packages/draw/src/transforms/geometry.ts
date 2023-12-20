import { PlaitBoard, Transforms, Point, Path, PlaitNode, getSelectedElements, findElements, PlaitElement } from '@plait/core';
import { PlaitDrawElement, PlaitGeometry, GeometryShapes, PlaitText, PlaitLine } from '../interfaces';
import { createDefaultGeometry, createDefaultText, getLinePoints, insertElement, transformPointToConnection } from '../utils';
import { Element } from 'slate';
import { normalizeShapePoints } from '@plait/common';
import { DrawTransforms } from '.';

export const insertGeometry = (board: PlaitBoard, points: [Point, Point], shape: GeometryShapes) => {
    const newElement = createDefaultGeometry(board, points, shape);
    insertElement(board, newElement);
};

export const insertText = (board: PlaitBoard, points: [Point, Point], text: string | Element = '文本') => {
    const newElement = createDefaultText(board, points);
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
    selectedElements.forEach(item => {
        if (PlaitDrawElement.isGeometry(item) && !PlaitDrawElement.isText(item)) {
            const path = PlaitBoard.findPath(board, item);
            Transforms.setNode(board, { shape }, path);
            updateLine(board, { ...item, shape });
        }
    });
};

export const updateLine = (board: PlaitBoard, geometry: PlaitGeometry) => {
    const lines = findElements(board, {
        match: (element: PlaitElement) => {
            if (PlaitDrawElement.isLine(element)) {
                return element.source.boundId === geometry.id || element.target.boundId === geometry.id;
            }
            return false;
        },
        recursion: element => true
    }) as PlaitLine[];
    if (lines.length) {
        lines.forEach(line => {
            const source = { ...line.source };
            const target = { ...line.target };
            const isSourceBound = line.source.boundId === geometry.id;
            const object = isSourceBound ? source : target;
            const linePoints = getLinePoints(board, line);
            const point = isSourceBound ? linePoints[0] : linePoints[linePoints.length - 1];
            object.connection = transformPointToConnection(board, point, geometry);
            const path = PlaitBoard.findPath(board, line);
            DrawTransforms.resizeLine(board, { source, target }, path);
        });
    }
};
