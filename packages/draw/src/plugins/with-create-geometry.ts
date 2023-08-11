import {
    BoardTransforms,
    PlaitBoard,
    PlaitPointerType,
    Point,
    RectangleClient,
    SELECTION_BORDER_COLOR,
    SELECTION_FILL_COLOR,
    createG,
    toPoint,
    transformPoint
} from '@plait/core';
import { GeometryShape, PlaitGeometry } from '../interfaces';
import { GeometryShapeGenerator } from '../generator/geometry-shape.generator';
import { DrawCreateMode, createGeometryElement, getCreateMode, getPointsByCenterPoint } from '../utils';
import { DefaultGeometryProperty, GeometryPointer } from '../constants';
import { normalizeShapePoints } from '@plait/common';
import { DrawTransform } from '../transforms';

export const withCreateGeometry = (board: PlaitBoard) => {
    const { mousedown, mousemove, mouseup } = board;
    let start: Point | null = null;
    let createMode: DrawCreateMode | undefined = undefined;

    let geometryShapeG: SVGGElement | null = null;

    const geometryGenerator: GeometryShapeGenerator = new GeometryShapeGenerator(board);

    board.mousedown = (event: MouseEvent) => {
        createMode = getCreateMode(board);

        const isGeometryPointer = PlaitBoard.isInPointer(board, GeometryPointer);
        if (isGeometryPointer && createMode === DrawCreateMode.draw) {
            const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            start = point;
        }
        mousedown(event);
    };

    board.mousemove = (event: MouseEvent) => {
        geometryShapeG?.remove();
        geometryShapeG = createG();

        createMode = getCreateMode(board);

        const isGeometryPointer = PlaitBoard.isInPointer(board, GeometryPointer);
        const dragMode = isGeometryPointer && createMode === DrawCreateMode.drag;
        const drawMode = !!start;

        const movingPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));

        if (drawMode) {
            const points = normalizeShapePoints([start!, movingPoint]);
            const temporaryElement = createGeometryElement(GeometryShape.rectangle, points, '', {
                fill: SELECTION_FILL_COLOR,
                strokeColor: SELECTION_BORDER_COLOR,
                strokeWidth: 1
            }) as PlaitGeometry;
            geometryGenerator.draw(temporaryElement, geometryShapeG);
            PlaitBoard.getElementHostActive(board).append(geometryShapeG);
        }

        if (dragMode) {
            const points = getPointsByCenterPoint(movingPoint, DefaultGeometryProperty.width, DefaultGeometryProperty.height);
            const temporaryElement = createGeometryElement(GeometryShape.rectangle, points, '', {
                fill: SELECTION_FILL_COLOR,
                strokeColor: '#333',
                strokeWidth: 2
            }) as PlaitGeometry;
            geometryGenerator.draw(temporaryElement, geometryShapeG);
            PlaitBoard.getElementHostActive(board).append(geometryShapeG);
        }

        mousemove(event);
    };

    board.mouseup = (event: MouseEvent) => {
        let points = null;
        const isGeometryPointer = PlaitBoard.isInPointer(board, GeometryPointer);

        if (start) {
            const targetPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));

            const { width, height } = RectangleClient.toRectangleClient([start, targetPoint]);
            if (Math.hypot(width, height) > 5) {
                points = normalizeShapePoints([start, targetPoint]);
            }
        }

        if (isGeometryPointer && createMode === DrawCreateMode.drag) {
            const movingPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            points = getPointsByCenterPoint(movingPoint, DefaultGeometryProperty.width, DefaultGeometryProperty.height);
        }

        if (isGeometryPointer && points) {
            DrawTransform.insertGeometry(board, points, GeometryShape.rectangle);
            BoardTransforms.updatePointerType(board, PlaitPointerType.selection);
        }

        geometryShapeG?.remove();

        geometryShapeG = null;
        start = null;

        mouseup(event);
    };

    return board;
};
