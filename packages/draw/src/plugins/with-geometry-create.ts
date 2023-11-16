import {
    BoardTransforms,
    PlaitBoard,
    PlaitPointerType,
    Point,
    RectangleClient,
    Transforms,
    addSelectedElement,
    clearSelectedElement,
    createForeignObject,
    createG,
    preventTouchMove,
    toPoint,
    transformPoint
} from '@plait/core';
import { BasicShapes, FlowchartSymbols, GeometryShapes, PlaitGeometry } from '../interfaces';
import { GeometryShapeGenerator } from '../generators/geometry-shape.generator';
import { createGeometryElement, getDefaultFlowchartProperty, getPointsByCenterPoint } from '../utils';
import {
    DefaultBasicShapeProperty,
    DefaultTextProperty,
    DrawPointerType,
    getFlowchartPointers,
    getGeometryPointers,
    ShapeDefaultSpace
} from '../constants';
import { normalizeShapePoints, isDndMode, isDrawingMode } from '@plait/common';
import { DrawTransforms } from '../transforms';
import { DEFAULT_FONT_SIZE } from '@plait/text';
import { isKeyHotkey } from 'is-hotkey';

export const withGeometryCreateByDrag = (board: PlaitBoard) => {
    const { pointerMove, pointerUp } = board;

    let geometryShapeG: SVGGElement | null = null;

    board.pointerMove = (event: PointerEvent) => {
        geometryShapeG?.remove();
        geometryShapeG = createG();

        const geometryGenerator = new GeometryShapeGenerator(board);
        const geometryPointers = getGeometryPointers();
        const isGeometryPointer = PlaitBoard.isInPointer(board, geometryPointers);
        const dragMode = isGeometryPointer && isDndMode(board);
        const movingPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        const pointer = PlaitBoard.getPointer(board) as DrawPointerType;

        if (dragMode) {
            const points = getDefaultGeometryPoints(pointer, movingPoint);
            if (pointer === BasicShapes.text) {
                const textG = getTemporaryTextG(movingPoint);
                geometryShapeG.appendChild(textG);
                PlaitBoard.getElementActiveHost(board).append(geometryShapeG);
            } else {
                const temporaryElement = createGeometryElement((pointer as unknown) as GeometryShapes, points, '', {
                    strokeColor: DefaultBasicShapeProperty.strokeColor,
                    strokeWidth: DefaultBasicShapeProperty.strokeWidth
                });
                geometryGenerator.draw(temporaryElement, geometryShapeG);
                PlaitBoard.getElementActiveHost(board).append(geometryShapeG);
            }
        }

        pointerMove(event);
    };

    board.pointerUp = (event: PointerEvent) => {
        const pointer = PlaitBoard.getPointer(board) as DrawPointerType;
        const geometryPointers = getGeometryPointers();
        const isGeometryPointer = PlaitBoard.isInPointer(board, geometryPointers);
        const dragMode = isGeometryPointer && isDndMode(board);

        if (dragMode) {
            const targetPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            const points = getDefaultGeometryPoints(pointer, targetPoint);
            if (pointer === BasicShapes.text) {
                DrawTransforms.insertText(board, points);
            } else {
                DrawTransforms.insertGeometry(board, points, (pointer as unknown) as GeometryShapes);
            }
            BoardTransforms.updatePointerType(board, PlaitPointerType.selection);
        }

        geometryShapeG?.remove();
        geometryShapeG = null;
        preventTouchMove(board, event, false);

        pointerUp(event);
    };

    return board;
};

export const withGeometryCreateByDrawing = (board: PlaitBoard) => {
    const { pointerDown, pointerMove, pointerUp, keydown, keyup } = board;
    let start: Point | null = null;

    let geometryShapeG: SVGGElement | null = null;

    let temporaryElement: PlaitGeometry | null = null;

    let isShift = false;

    board.keydown = (event: KeyboardEvent) => {
        isShift = isKeyHotkey('shift', event);
        keydown(event);
    };

    board.keyup = (event: KeyboardEvent) => {
        isShift = false;
        keyup(event);
    };

    board.pointerDown = (event: PointerEvent) => {
        const geometryPointers = getGeometryPointers();
        const isGeometryPointer = PlaitBoard.isInPointer(board, geometryPointers);
        if (isGeometryPointer && isDrawingMode(board)) {
            const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            start = point;
            const pointer = PlaitBoard.getPointer(board) as DrawPointerType;
            preventTouchMove(board, event, true);
            if (pointer === BasicShapes.text) {
                const points = getDefaultGeometryPoints(pointer, point);
                const textElement = createGeometryElement(BasicShapes.text, points, DefaultTextProperty.text);
                Transforms.insertNode(board, textElement, [board.children.length]);
                clearSelectedElement(board);
                addSelectedElement(board, textElement);
                BoardTransforms.updatePointerType(board, PlaitPointerType.selection);
                start = null;
            }
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
        if (drawMode && pointer !== BasicShapes.text) {
            const points = normalizeShapePoints([start!, movingPoint], isShift);
            temporaryElement = createGeometryElement((pointer as unknown) as GeometryShapes, points, '', {
                strokeColor: DefaultBasicShapeProperty.strokeColor,
                strokeWidth: DefaultBasicShapeProperty.strokeWidth
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
                if (pointer !== BasicShapes.text) {
                    temporaryElement = createGeometryElement((pointer as unknown) as GeometryShapes, points, '', {
                        strokeColor: DefaultBasicShapeProperty.strokeColor,
                        strokeWidth: DefaultBasicShapeProperty.strokeWidth
                    });
                }
            }
        }
        if (temporaryElement) {
            Transforms.insertNode(board, temporaryElement, [board.children.length]);
            clearSelectedElement(board);
            addSelectedElement(board, temporaryElement);
            BoardTransforms.updatePointerType(board, PlaitPointerType.selection);
        }

        geometryShapeG?.remove();
        geometryShapeG = null;
        start = null;
        temporaryElement = null;
        preventTouchMove(board, event, false);

        pointerUp(event);
    };

    return board;
};

export const getDefaultGeometryPoints = (pointer: DrawPointerType, targetPoint: Point) => {
    const defaultProperty = getGeometryDefaultProperty(pointer);
    return getPointsByCenterPoint(targetPoint, defaultProperty.width, defaultProperty.height);
};

export const getGeometryDefaultProperty = (pointer: DrawPointerType) => {
    const isText = pointer === BasicShapes.text;
    const isFlowChart = getFlowchartPointers().includes(pointer);
    if (isText) {
        return DefaultTextProperty;
    } else if (isFlowChart) {
        return getDefaultFlowchartProperty(pointer as FlowchartSymbols);
    } else {
        return DefaultBasicShapeProperty;
    }
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
    richtext.style.cursor = 'default';
    foreignObject.appendChild(richtext);
    textG.appendChild(foreignObject);

    return textG;
};
