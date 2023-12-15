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
import { BasicShapes, FlowchartSymbols, GeometryShapes, PlaitGeometry } from '../interfaces';
import { GeometryShapeGenerator } from '../generators/geometry-shape.generator';
import {
    GeometryStyleOptions,
    createGeometryElement,
    getDefaultFlowchartProperty,
    getDefaultTextProperty,
    getMemorizedLatestByPointer,
    getPointsByCenterPoint,
    getTextRectangle,
    memorizeLatestShape
} from '../utils';
import {
    DefaultBasicShapeProperty,
    DefaultTextProperty,
    DrawPointerType,
    ShapeDefaultSpace,
    getFlowchartPointers,
    getGeometryPointers
} from '../constants';
import { normalizeShapePoints, isDndMode, isDrawingMode, getRectangleByPoints } from '@plait/common';
import { DEFAULT_FONT_SIZE, TextManage } from '@plait/text';
import { isKeyHotkey } from 'is-hotkey';
import { NgZone } from '@angular/core';

export interface FakeCreateNodeRef {
    g: SVGGElement;
    textManage: TextManage;
}

export const withGeometryCreateByDrag = (board: PlaitBoard) => {
    const { pointerMove, pointerUp } = board;

    let geometryShapeG: SVGGElement | null = null;

    let temporaryElement: PlaitGeometry | null = null;

    let fakeCreateNodeRef: FakeCreateNodeRef | null = null;

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
                const points = getDefaultGeometryPoints(
                    board,
                    pointer,
                    movingPoint,
                    memorizedLatest.textProperties['font-size'] || DEFAULT_FONT_SIZE
                );
                temporaryElement = createGeometryElement(
                    board,
                    BasicShapes.text,
                    points,
                    DefaultTextProperty.text,
                    memorizedLatest.geometryProperties as GeometryStyleOptions,
                    memorizedLatest.textProperties
                );
                if (!fakeCreateNodeRef) {
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
                    fakeCreateNodeRef = {
                        g: createG(),
                        textManage
                    };

                    PlaitBoard.getHost(board).append(fakeCreateNodeRef.g);
                    fakeCreateNodeRef.g.append(textManage.g);
                } else {
                    fakeCreateNodeRef.textManage.updateRectangle();
                    fakeCreateNodeRef.g.append(fakeCreateNodeRef.textManage.g);
                }
            } else {
                const points = getDefaultGeometryPoints(board, pointer, movingPoint);
                temporaryElement = createGeometryElement(
                    board,
                    (pointer as unknown) as GeometryShapes,
                    points,
                    '',
                    {
                        strokeWidth: DefaultBasicShapeProperty.strokeWidth,
                        ...(memorizedLatest.geometryProperties as GeometryStyleOptions)
                    },
                    memorizedLatest.textProperties
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
            fakeCreateNodeRef?.textManage.destroy();
            fakeCreateNodeRef?.g.remove();
            fakeCreateNodeRef = null;
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
                const points = getDefaultGeometryPoints(
                    board,
                    pointer,
                    point,
                    memorizedLatest.textProperties['font-size'] || DEFAULT_FONT_SIZE
                );
                const textElement = createGeometryElement(
                    board,
                    BasicShapes.text,
                    points,
                    DefaultTextProperty.text,
                    memorizedLatest.geometryProperties as GeometryStyleOptions,
                    memorizedLatest.textProperties
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
            temporaryElement = createGeometryElement(
                board,
                (pointer as unknown) as GeometryShapes,
                points,
                '',
                {
                    strokeWidth: DefaultBasicShapeProperty.strokeWidth,
                    ...memorizedLatest.geometryProperties
                },
                memorizedLatest.textProperties
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
                const points = getDefaultGeometryPoints(board, pointer, targetPoint);
                if (pointer !== BasicShapes.text) {
                    const memorizedLatest = getMemorizedLatestByPointer(pointer);
                    temporaryElement = createGeometryElement(
                        board,
                        (pointer as unknown) as GeometryShapes,
                        points,
                        '',
                        {
                            strokeWidth: DefaultBasicShapeProperty.strokeWidth,
                            ...memorizedLatest.geometryProperties
                        },
                        memorizedLatest.textProperties
                    );
                }
            }
        }
        if (temporaryElement) {
            insertElement(board, temporaryElement)
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

export const getDefaultGeometryPoints = (board: PlaitBoard, pointer: DrawPointerType, targetPoint: Point, fontSize?: number) => {
    const defaultProperty = getGeometryDefaultProperty(board, pointer, fontSize);
    return getPointsByCenterPoint(targetPoint, defaultProperty.width, defaultProperty.height);
};

export const getGeometryDefaultProperty = (board: PlaitBoard, pointer: DrawPointerType, fontSize?: number) => {
    const isText = pointer === BasicShapes.text;
    const isFlowChart = getFlowchartPointers().includes(pointer);
    if (isText) {
        const textProperty = getDefaultTextProperty(board, fontSize || DEFAULT_FONT_SIZE);
        return {
            width: textProperty.width + ShapeDefaultSpace.rectangleAndText * 2,
            height: textProperty.height
        };
    } else if (isFlowChart) {
        return getDefaultFlowchartProperty(pointer as FlowchartSymbols);
    } else {
        return DefaultBasicShapeProperty;
    }
};

const insertElement = (board: PlaitBoard, element: PlaitGeometry) => {
    memorizeLatestShape(board, element.shape);
    Transforms.insertNode(board, element, [board.children.length]);
    clearSelectedElement(board);
    addSelectedElement(board, element);
    BoardTransforms.updatePointerType(board, PlaitPointerType.selection);
};
