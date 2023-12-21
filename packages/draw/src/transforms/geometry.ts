import { PlaitBoard, Transforms, Point, Path, PlaitNode, getSelectedElements, Vector, Direction } from '@plait/core';
import { PlaitDrawElement, GeometryShapes, PlaitText, PlaitLine, FlowchartSymbols } from '../interfaces';
import { createDefaultGeometry, createDefaultText, getPointsByCenterPoint, insertElement } from '../utils';
import { Element } from 'slate';
import { getDirectionByVector, getPointByVector, normalizeShapePoints } from '@plait/common';
import { DrawTransforms } from '.';
import { collectLineUpdatedRefsByGeometry } from './line';
import { DefaultBasicShapeProperty, DefaultFlowchartPropertyMap } from '../constants';

export const insertGeometry = (board: PlaitBoard, points: [Point, Point], shape: GeometryShapes) => {
    const newElement = createDefaultGeometry(board, points, shape);
    insertElement(board, newElement);
    return newElement;
};

export const insertGeometryByVector = (board: PlaitBoard, point: Point, shape: GeometryShapes, vector: Vector) => {
    const shapeProperty = DefaultFlowchartPropertyMap[shape as FlowchartSymbols] || DefaultBasicShapeProperty;
    const direction = getDirectionByVector(vector);
    if (direction) {
        let offset = 0;
        if ([Direction.left, Direction.right].includes(direction)) {
            offset = -shapeProperty.width / 2;
        } else {
            offset = -shapeProperty.height / 2;
        }
        const vectorPoint = getPointByVector(point, vector, offset);
        const points = getPointsByCenterPoint(vectorPoint, shapeProperty.width, shapeProperty.height);
        return insertGeometry(board, points, shape);
    }
    return null;
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
    const refs: { property: Partial<PlaitLine>; path: Path }[] = [];
    selectedElements.forEach(item => {
        if (PlaitDrawElement.isGeometry(item) && !PlaitDrawElement.isText(item)) {
            const path = PlaitBoard.findPath(board, item);
            Transforms.setNode(board, { shape }, path);
            collectLineUpdatedRefsByGeometry(board, { ...item, shape }, refs);
        }
    });
    if (refs.length) {
        refs.forEach(ref => {
            DrawTransforms.resizeLine(board, ref.property, ref.path);
        });
    }
};
