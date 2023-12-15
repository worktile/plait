import {
    BoardTransforms,
    PlaitBoard,
    PlaitPointerType,
    Point,
    RectangleClient,
    Transforms,
    addSelectedElement,
    clearSelectedElement,
    createG,
    preventTouchMove,
    toPoint,
    transformPoint
} from '@plait/core';
import { BasicShapes, GeometryShapes, PlaitGeometry } from '../interfaces';
import { GeometryShapeGenerator } from '../generators/geometry-shape.generator';
import {
    GeometryStyleOptions,
    createGeometryElement,
    getDefaultGeometryPoints,
    getDefaultTextShapeProperty,
    getMemorizedLatestByPointer,
    getPointsByCenterPoint,
    getTextRectangle,
    memorizeLatestShape
} from '../utils';
import { DefaultBasicShapeProperty, DefaultTextProperty, DrawPointerType, getGeometryPointers } from '../constants';
import { normalizeShapePoints, isDndMode, isDrawingMode } from '@plait/common';
import { TextManage } from '@plait/text';
import { isKeyHotkey } from 'is-hotkey';
import { NgZone } from '@angular/core';

export interface FakeCreateTextRef {
    g: SVGGElement;
    textManage: TextManage;
}

export const withGeometryCreateByDrag = (board: PlaitBoard) => {
    const { pointerMove, pointerUp } = board;

    let geometryShapeG: SVGGElement | null = null;

    let temporaryElement: PlaitGeometry | null = null;

    let fakeCreateTextRef: FakeCreateTextRef | null = null;

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
            const memorizedLatest = getMemorizedLatestByPointer(pointer);
            if (pointer === BasicShapes.text) {
                const property = getDefaultTextShapeProperty(board, memorizedLatest.textProperties['font-size']);
                const points = getPointsByCenterPoint(movingPoint, property.width, property.height);
                temporaryElement = createGeometryElement(
                    BasicShapes.text,
                    points,
                    DefaultTextProperty.text,
                    memorizedLatest.geometryProperties as GeometryStyleOptions,
                    { ...memorizedLatest.textProperties, textHeight: property.height }
                );
                if (!fakeCreateTextRef) {
                    const textManage = new TextManage(board, PlaitBoard.getComponent(board).viewContainerRef, {
                        getRectangle: () => {
                            return getTextRectangle(temporaryElement!);
                        }
                    });
                    PlaitBoard.getComponent(board)
                        .viewContainerRef.injector.get(NgZone)
                        .run(() => {
                            textManage.draw(temporaryElement!.text);
                        });
                    fakeCreateTextRef = {
                        g: createG(),
                        textManage
                    };

                    PlaitBoard.getHost(board).append(fakeCreateTextRef.g);
                    fakeCreateTextRef.g.append(textManage.g);
                } else {
                    fakeCreateTextRef.textManage.updateRectangle();
                    fakeCreateTextRef.g.append(fakeCreateTextRef.textManage.g);
                }
            } else {
                const points = getDefaultGeometryPoints(pointer, movingPoint);
                const textHeight = getDefaultTextShapeProperty(board, memorizedLatest.textProperties['font-size']).height;
                temporaryElement = createGeometryElement(
                    (pointer as unknown) as GeometryShapes,
                    points,
                    '',
                    {
                        strokeWidth: DefaultBasicShapeProperty.strokeWidth,
                        ...(memorizedLatest.geometryProperties as GeometryStyleOptions)
                    },
                    { ...memorizedLatest.textProperties, textHeight }
                );
                geometryGenerator.processDrawing(temporaryElement, geometryShapeG);
                PlaitBoard.getElementActiveHost(board).append(geometryShapeG);
            }
        }

        pointerMove(event);
    };

    board.pointerUp = (event: PointerEvent) => {
        const geometryPointers = getGeometryPointers();
        const isGeometryPointer = PlaitBoard.isInPointer(board, geometryPointers);
        const dragMode = isGeometryPointer && isDndMode(board);

        if (dragMode && temporaryElement) {
            insertElement(board, temporaryElement);
            fakeCreateTextRef?.textManage.destroy();
            fakeCreateTextRef?.g.remove();
            fakeCreateTextRef = null;
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
        if (!PlaitBoard.isReadonly(board) && isGeometryPointer && isDrawingMode(board)) {
            const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            start = point;
            const pointer = PlaitBoard.getPointer(board) as DrawPointerType;
            preventTouchMove(board, event, true);
            if (pointer === BasicShapes.text) {
                const memorizedLatest = getMemorizedLatestByPointer(pointer);
                const property = getDefaultTextShapeProperty(board, memorizedLatest.textProperties['font-size']);
                const points = getPointsByCenterPoint(point, property.width, property.height);
                const textElement = createGeometryElement(
                    BasicShapes.text,
                    points,
                    DefaultTextProperty.text,
                    memorizedLatest.geometryProperties as GeometryStyleOptions,
                    { ...memorizedLatest.textProperties, textHeight: property.height }
                );
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
            const memorizedLatest = getMemorizedLatestByPointer(pointer);
            const textHeight = getDefaultTextShapeProperty(board, memorizedLatest.textProperties['font-size']).height;
            temporaryElement = createGeometryElement(
                (pointer as unknown) as GeometryShapes,
                points,
                '',
                {
                    strokeWidth: DefaultBasicShapeProperty.strokeWidth,
                    ...memorizedLatest.geometryProperties
                },
                { ...memorizedLatest.textProperties, textHeight }
            );
            geometryGenerator.processDrawing(temporaryElement, geometryShapeG);
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
                if (pointer !== BasicShapes.text) {
                    const points = getDefaultGeometryPoints(pointer, targetPoint);
                    const memorizedLatest = getMemorizedLatestByPointer(pointer);
                    const textHeight = getDefaultTextShapeProperty(board, memorizedLatest.textProperties['font-size']).height;
                    temporaryElement = createGeometryElement(
                        (pointer as unknown) as GeometryShapes,
                        points,
                        '',
                        {
                            strokeWidth: DefaultBasicShapeProperty.strokeWidth,
                            ...memorizedLatest.geometryProperties
                        },
                        { ...memorizedLatest.textProperties, textHeight }
                    );
                }
            }
        }
        if (temporaryElement) {
            insertElement(board, temporaryElement);
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

const insertElement = (board: PlaitBoard, element: PlaitGeometry) => {
    memorizeLatestShape(board, element.shape);
    Transforms.insertNode(board, element, [board.children.length]);
    clearSelectedElement(board);
    addSelectedElement(board, element);
    BoardTransforms.updatePointerType(board, PlaitPointerType.selection);
};
