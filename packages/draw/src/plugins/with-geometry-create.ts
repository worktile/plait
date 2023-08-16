import {
    BoardTransforms,
    PlaitBoard,
    PlaitPointerType,
    Point,
    RectangleClient,
    SELECTION_BORDER_COLOR,
    SELECTION_FILL_COLOR,
    createG,
    preventTouchMove,
    toPoint,
    transformPoint
} from '@plait/core';
import { GeometryShape, PlaitGeometry } from '../interfaces';
import { GeometryShapeGenerator } from '../generator/geometry-shape.generator';
import { DrawCreateMode, createGeometryElement, getCreateMode, getPointsByCenterPoint } from '../utils';
import { DefaultGeometryProperty, DefaultTextProperty, DrawPointerType, GeometryPointer } from '../constants';
import { normalizeShapePoints } from '@plait/common';
import { DrawTransform } from '../transforms';

export const withGeometryCreate = (board: PlaitBoard) => {
    const { pointerDown, pointerMove, pointerUp } = board;
    let start: Point | null = null;
    let createMode: DrawCreateMode | undefined = undefined;

    let geometryShapeG: SVGGElement | null = null;

    const geometryGenerator: GeometryShapeGenerator = new GeometryShapeGenerator(board);

    board.pointerDown = (event: PointerEvent) => {
        createMode = getCreateMode(board);

        const isGeometryPointer = PlaitBoard.isInPointer(board, GeometryPointer);
        if (isGeometryPointer && createMode === DrawCreateMode.draw) {
            const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            start = point;
            preventTouchMove(board, true);
        }
        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
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
            const pointer = PlaitBoard.getPointer(board) as DrawPointerType;
            const points =
                pointer === DrawPointerType.text
                    ? getPointsByCenterPoint(movingPoint, DefaultTextProperty.width, DefaultTextProperty.height)
                    : getPointsByCenterPoint(movingPoint, DefaultGeometryProperty.width, DefaultGeometryProperty.height);
            let temporaryElement =
                pointer === DrawPointerType.text
                    ? createGeometryElement(GeometryShape.text, points, 'text')
                    : createGeometryElement(GeometryShape.rectangle, points, '', {
                          strokeColor: '#333',
                          strokeWidth: 2
                      });

            geometryGenerator.draw(temporaryElement, geometryShapeG);
            PlaitBoard.getElementHostActive(board).append(geometryShapeG);
        }

        pointerMove(event);
    };

    board.pointerUp = (event: PointerEvent) => {
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
            const pointer = PlaitBoard.getPointer(board) as DrawPointerType;
            if (pointer === DrawPointerType.rectangle) {
                DrawTransform.insertGeometry(board, points, GeometryShape.rectangle);
            }

            if (pointer === DrawPointerType.text) {
                DrawTransform.insertText(board, points);
            }

            BoardTransforms.updatePointerType(board, PlaitPointerType.selection);
        }

        geometryShapeG?.remove();

        geometryShapeG = null;
        start = null;
        preventTouchMove(board, false);

        pointerUp(event);
    };

    return board;
};
