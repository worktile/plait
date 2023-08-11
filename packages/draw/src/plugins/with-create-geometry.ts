import {
    BoardTransforms,
    PlaitBoard,
    PlaitPointerType,
    Point,
    RectangleClient,
    SELECTION_BORDER_COLOR,
    SELECTION_FILL_COLOR,
    Transforms,
    createG,
    toPoint,
    transformPoint
} from '@plait/core';
import { GeometryShape, PlaitGeometry } from '../interfaces';
import { GeometryShapeGenerator } from '../generator/geometry-shape.generator';
import { DrawCreateMode, createGeometryElement, getCreateMode, getPointsByCenterPoint } from '../utils';
import { DefaultGeometryProperty, geometryPointer } from '../constants';
import { normalizeShapePoints } from '@plait/common';
import { DrawTransform } from '../transforms';

export const withCreateGeometry = (board: PlaitBoard) => {
    const { mousedown, mousemove, mouseup } = board;
    let start: Point | null = null;
    let end: Point | null = null;
    let createMode: DrawCreateMode | undefined = undefined;

    let geometryShapeG: SVGGElement | null = null;

    const geometryGenerator: GeometryShapeGenerator = new GeometryShapeGenerator(board);

    board.mousedown = (event: MouseEvent) => {
        createMode = getCreateMode(board);

        const isGeometryPointer = PlaitBoard.isInPointer(board, geometryPointer);
        if (isGeometryPointer && createMode === DrawCreateMode.draw) {
            const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            start = point;
        }
        mousedown(event);
    };

    board.mousemove = (event: MouseEvent) => {
        geometryShapeG?.remove();

        const isGeometryPointer = PlaitBoard.isInPointer(board, geometryPointer);

        createMode = getCreateMode(board);
        const dragMode = isGeometryPointer && createMode === DrawCreateMode.drag;
        const canDraw = start || dragMode;

        if (canDraw) {
            const movedTarget = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            geometryShapeG = createG();

            if (start) {
                const { width, height } = RectangleClient.toRectangleClient([start, movedTarget]);
                if (Math.hypot(width, height) > 5) {
                    end = movedTarget;
                    const points = normalizeShapePoints([start, movedTarget]);
                    const temporaryElement = createGeometryElement(GeometryShape.rectangle, points, '', {
                        fill: SELECTION_FILL_COLOR,
                        strokeColor: SELECTION_BORDER_COLOR,
                        strokeWidth: 1
                    }) as PlaitGeometry;
                    geometryGenerator.draw(temporaryElement, geometryShapeG);
                    PlaitBoard.getElementHostActive(board).append(geometryShapeG);
                }
            }

            if (dragMode) {
                const movingPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
                const points = getPointsByCenterPoint(movingPoint, DefaultGeometryProperty.width, DefaultGeometryProperty.height);
                const temporaryElement = createGeometryElement(GeometryShape.rectangle, points, '', {
                    fill: SELECTION_FILL_COLOR,
                    strokeColor: '#333',
                    strokeWidth: 2
                }) as PlaitGeometry;
                geometryGenerator.draw(temporaryElement, geometryShapeG);
                PlaitBoard.getElementHostActive(board).append(geometryShapeG);
            }
        }

        mousemove(event);
    };

    board.mouseup = (event: MouseEvent) => {
        let points = null;
        const isGeometryPointer = PlaitBoard.isInPointer(board, geometryPointer);

        if (start && end) {
            const { width, height } = RectangleClient.toRectangleClient([start, end]);
            if (Math.hypot(width, height) > 5) {
                points = normalizeShapePoints([start, end]);
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
        end = null;

        mouseup(event);
    };

    return board;
};
