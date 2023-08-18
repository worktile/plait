import {
    BoardTransforms,
    PlaitBoard,
    PlaitPointerType,
    Point,
    RectangleClient,
    Transforms,
    createForeignObject,
    createG,
    preventTouchMove,
    toPoint,
    transformPoint
} from '@plait/core';
import { GeometryShape, PlaitGeometry } from '../interfaces';
import { GeometryShapeGenerator } from '../generator/geometry-shape.generator';
import { DrawCreateMode, createGeometryElement, getCreateMode, getPointsByCenterPoint } from '../utils';
import { DefaultGeometryProperty, DefaultTextProperty, DrawPointerType, GeometryPointer, ShapeDefaultSpace } from '../constants';
import { normalizeShapePoints } from '@plait/common';
import { DrawTransform } from '../transforms';
import { DEFAULT_FONT_SIZE } from '@plait/text';

export const withGeometryCreateByDrag = (board: PlaitBoard) => {
    const { pointerMove, pointerUp } = board;

    let createMode: DrawCreateMode | undefined = undefined;

    let geometryShapeG: SVGGElement | null = null;

    board.pointerMove = (event: PointerEvent) => {
        geometryShapeG?.remove();
        geometryShapeG = createG();
        createMode = getCreateMode(board);

        const geometryGenerator = new GeometryShapeGenerator(board);
        const isGeometryPointer = PlaitBoard.isInPointer(board, GeometryPointer);
        const dragMode = isGeometryPointer && createMode === DrawCreateMode.drag;
        const movingPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        const pointer = PlaitBoard.getPointer(board) as DrawPointerType;

        if (dragMode) {
            const points = getDefaultGeometryPoints(pointer, movingPoint);
            if (pointer === DrawPointerType.text) {
                const textG = getTemporaryTextG(movingPoint);
                geometryShapeG.appendChild(textG);
                PlaitBoard.getElementActiveHost(board).append(geometryShapeG);
            } else {
                const temporaryElement = createGeometryElement(GeometryShape.rectangle, points, '', {
                    strokeColor: DefaultGeometryProperty.strokeColor,
                    strokeWidth: DefaultGeometryProperty.stokeWidth
                });
                geometryGenerator.draw(temporaryElement, geometryShapeG);
                PlaitBoard.getElementActiveHost(board).append(geometryShapeG);
            }
        }

        pointerMove(event);
    };

    board.pointerUp = (event: PointerEvent) => {
        const pointer = PlaitBoard.getPointer(board) as DrawPointerType;
        const isGeometryPointer = PlaitBoard.isInPointer(board, GeometryPointer);
        const dragMode = isGeometryPointer && createMode === DrawCreateMode.drag;

        if (dragMode) {
            const targetPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            const points = getDefaultGeometryPoints(pointer, targetPoint);
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
        preventTouchMove(board, false);

        pointerUp(event);
    };

    return board;
};

export const withGeometryCreateByDraw = (board: PlaitBoard) => {
    const { pointerDown, pointerMove, pointerUp } = board;
    let start: Point | null = null;

    let geometryShapeG: SVGGElement | null = null;

    let temporaryElement: PlaitGeometry | null = null;

    board.pointerDown = (event: PointerEvent) => {
        const createMode = getCreateMode(board);

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
        const geometryGenerator = new GeometryShapeGenerator(board);
        const drawMode = !!start;
        const movingPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        const pointer = PlaitBoard.getPointer(board) as DrawPointerType;

        if (drawMode && pointer !== DrawPointerType.text) {
            const points = normalizeShapePoints([start!, movingPoint]);
            temporaryElement = createGeometryElement(GeometryShape.rectangle, points, '', {
                strokeColor: DefaultGeometryProperty.strokeColor,
                strokeWidth: DefaultGeometryProperty.stokeWidth
            });
            geometryGenerator.draw(temporaryElement, geometryShapeG);
            PlaitBoard.getElementActiveHost(board).append(geometryShapeG);
        }

        pointerMove(event);
    };

    board.pointerUp = (event: PointerEvent) => {
        const isDrawMode = !!start;
        if (isDrawMode) {
            const targetPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            const { width, height } = RectangleClient.toRectangleClient([start!, targetPoint]);
            if (Math.hypot(width, height) === 0) {
                const pointer = PlaitBoard.getPointer(board) as DrawPointerType;
                const points = getDefaultGeometryPoints(pointer, targetPoint);
                if (pointer === DrawPointerType.text) {
                    temporaryElement = createGeometryElement(GeometryShape.text, points, DefaultTextProperty.text);
                } else {
                    temporaryElement = createGeometryElement(GeometryShape.rectangle, points, '', {
                        strokeColor: DefaultGeometryProperty.strokeColor,
                        strokeWidth: DefaultGeometryProperty.stokeWidth
                    });
                }
            }
        }
        if (temporaryElement) {
            Transforms.insertNode(board, temporaryElement, [board.children.length]);
            BoardTransforms.updatePointerType(board, PlaitPointerType.selection);
        }

        geometryShapeG?.remove();
        geometryShapeG = null;
        start = null;
        temporaryElement = null;
        preventTouchMove(board, false);

        pointerUp(event);
    };

    return board;
};

const getDefaultGeometryPoints = (pointer: DrawPointerType, targetPoint: Point) => {
    return pointer === DrawPointerType.text
        ? getPointsByCenterPoint(targetPoint, DefaultTextProperty.width, DefaultTextProperty.height)
        : getPointsByCenterPoint(targetPoint, DefaultGeometryProperty.width, DefaultGeometryProperty.height);
};

const getTemporaryTextG = (movingPoint: Point) => {
    const textG = createG();
    const width = DefaultTextProperty.width - ShapeDefaultSpace.rectangleAndText * 2;
    const foreignObject = createForeignObject(
        movingPoint[0] - width / 2,
        movingPoint[1] - DefaultTextProperty.height / 2,
        width,
        DefaultTextProperty.height
    );

    const richtext = document.createElement('div');
    richtext.textContent = DefaultTextProperty.text;
    richtext.style.fontSize = `${DEFAULT_FONT_SIZE}px`;
    foreignObject.appendChild(richtext);
    textG.appendChild(foreignObject);

    return textG;
};
