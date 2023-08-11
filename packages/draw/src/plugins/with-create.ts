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
import {
    DrawCreateMode,
    createGeometryElement,
    getCreateMode,
    getIsGeometryPointer,
    getPointsByCenterPoint,
    transformPointsToGeoPoints
} from '../utils';
import { DrawPointerType } from '../constants/pointer';
import { DEFAULT_RECTANGLE_HEIGHT, DEFAULT_RECTANGLE_WIDTH } from '../constants';

export const withCreateGeometry = (board: PlaitBoard) => {
    const { mousedown, mousemove, mouseup } = board;
    let start: Point | null = null;
    let end: Point | null = null;
    let createMode: DrawCreateMode | undefined = undefined;

    let rectangleG: SVGGElement;

    let geometryGenerator: GeometryShapeGenerator = new GeometryShapeGenerator(board);

    board.mousedown = (event: MouseEvent) => {
        createMode = getCreateMode(board);

        const isGeometryPointer = getIsGeometryPointer(board);
        if (isGeometryPointer && createMode === DrawCreateMode.draw) {
            const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            start = point;
        }
        mousedown(event);
    };

    board.mousemove = (event: MouseEvent) => {
        rectangleG?.remove();

        const isGeometryPointer = getIsGeometryPointer(board);

        createMode = getCreateMode(board);
        const dragMode = isGeometryPointer && createMode === DrawCreateMode.drag;
        const canDraw = start || dragMode;

        if (canDraw) {
            const movedTarget = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            let points = null,
                temporaryElement = null;

            rectangleG = createG();

            if (start) {
                const { width, height } = RectangleClient.toRectangleClient([start, movedTarget]);
                if (Math.hypot(width, height) > 5) {
                    end = movedTarget;
                    points = transformPointsToGeoPoints([start, movedTarget]);
                    temporaryElement = createGeometryElement(GeometryShape.rectangle, points, '', {
                        fill: SELECTION_FILL_COLOR,
                        strokeColor: SELECTION_BORDER_COLOR,
                        strokeWidth: 1
                    }) as PlaitGeometry;
                }
            }

            if (dragMode) {
                const movingPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
                points = getPointsByCenterPoint(movingPoint, DEFAULT_RECTANGLE_WIDTH, DEFAULT_RECTANGLE_HEIGHT);
                temporaryElement = createGeometryElement(GeometryShape.rectangle, points, '', {
                    fill: SELECTION_FILL_COLOR,
                    strokeColor: '#333',
                    strokeWidth: 2
                }) as PlaitGeometry;
            }

            if (points && temporaryElement) {
                geometryGenerator.draw(temporaryElement, rectangleG);
                PlaitBoard.getElementHostActive(board).append(rectangleG);
            }
        }

        mousemove(event);
    };

    board.mouseup = (event: MouseEvent) => {
        let points = null;
        const isGeometryPointer = getIsGeometryPointer(board);

        if (start && end) {
            const { width, height } = RectangleClient.toRectangleClient([start, end]);
            if (Math.hypot(width, height) > 5) {
                points = transformPointsToGeoPoints([start, end]);
            }
        }

        if (isGeometryPointer && createMode === DrawCreateMode.drag) {
            const movingPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            points = getPointsByCenterPoint(movingPoint, DEFAULT_RECTANGLE_WIDTH, DEFAULT_RECTANGLE_HEIGHT);
        }

        if (isGeometryPointer && points) {
            let newElement = createGeometryElement(GeometryShape.rectangle, points, '', {
                strokeColor: '#333',
                strokeWidth: 2
            }) as PlaitGeometry;

            Transforms.insertNode(board, newElement, [board.children.length]);
            BoardTransforms.updatePointerType(board, PlaitPointerType.selection);
        }

        rectangleG?.remove();
        start = null;
        end = null;

        mouseup(event);
    };

    return board;
};
