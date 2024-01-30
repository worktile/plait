import { PlaitBoard, Point, RectangleClient, createG, preventTouchMove, toHostPoint, toViewBoxPoint } from '@plait/core';
import { BasicShapes, GeometryShapes, PlaitGeometry } from '../interfaces';
import { GeometryShapeGenerator } from '../generators/geometry-shape.generator';
import {
    createDefaultGeometry,
    createTextElement,
    getDefaultGeometryPoints,
    getTextShapeProperty,
    getMemorizedLatestByPointer,
    getTextRectangle,
    insertElement
} from '../utils';
import { DefaultTextProperty, DrawPointerType, getGeometryPointers } from '../constants';
import { normalizeShapePoints, isDndMode, isDrawingMode } from '@plait/common';
import { TextManage } from '@plait/text';
import { isKeyHotkey } from 'is-hotkey';
import { NgZone } from '@angular/core';

export interface FakeCreateTextRef {
    g: SVGGElement;
    textManage: TextManage;
}

export const withGeometryCreateByDrag = (board: PlaitBoard) => {
    const { pointerMove, globalPointerUp } = board;

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
        const movingPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        const pointer = PlaitBoard.getPointer(board) as DrawPointerType;

        if (dragMode) {
            const memorizedLatest = getMemorizedLatestByPointer(pointer);
            if (pointer === BasicShapes.text) {
                const property = getTextShapeProperty(board, DefaultTextProperty.text, memorizedLatest.textProperties['font-size']);
                const points = RectangleClient.getPoints(
                    RectangleClient.getRectangleByCenterPoint(movingPoint, property.width, property.height)
                );
                temporaryElement = createTextElement(board, points);
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
                temporaryElement = createDefaultGeometry(board, points, pointer as GeometryShapes);
                geometryGenerator.processDrawing(temporaryElement, geometryShapeG);
                PlaitBoard.getElementActiveHost(board).append(geometryShapeG);
            }
        }

        pointerMove(event);
    };

    board.globalPointerUp = (event: PointerEvent) => {
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

        globalPointerUp(event);
    };

    return board;
};

export const withGeometryCreateByDrawing = (board: PlaitBoard) => {
    const { pointerDown, pointerMove, pointerUp, keyDown, keyUp } = board;
    let start: Point | null = null;

    let geometryShapeG: SVGGElement | null = null;

    let temporaryElement: PlaitGeometry | null = null;

    let isShift = false;

    board.keyDown = (event: KeyboardEvent) => {
        isShift = isKeyHotkey('shift', event);
        keyDown(event);
    };

    board.keyUp = (event: KeyboardEvent) => {
        isShift = false;
        keyUp(event);
    };

    board.pointerDown = (event: PointerEvent) => {
        const geometryPointers = getGeometryPointers();
        const isGeometryPointer = PlaitBoard.isInPointer(board, geometryPointers);
        if (!PlaitBoard.isReadonly(board) && isGeometryPointer && isDrawingMode(board)) {
            const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            start = point;
            const pointer = PlaitBoard.getPointer(board) as DrawPointerType;
            preventTouchMove(board, event, true);
            if (pointer === BasicShapes.text) {
                const memorizedLatest = getMemorizedLatestByPointer(pointer);
                const property = getTextShapeProperty(board, DefaultTextProperty.text, memorizedLatest.textProperties['font-size']);
                const points = RectangleClient.getPoints(
                    RectangleClient.getRectangleByCenterPoint(point, property.width, property.height)
                );
                const textElement = createTextElement(board, points);
                insertElement(board, textElement);
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
        const movingPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        const pointer = PlaitBoard.getPointer(board) as DrawPointerType;
        if (drawMode && pointer !== BasicShapes.text) {
            const points = normalizeShapePoints([start!, movingPoint], isShift);
            temporaryElement = createDefaultGeometry(board, points, pointer as GeometryShapes);
            geometryGenerator.processDrawing(temporaryElement, geometryShapeG);
            PlaitBoard.getElementActiveHost(board).append(geometryShapeG);
        }

        pointerMove(event);
    };

    board.pointerUp = (event: PointerEvent) => {
        const isDrawMode = !!start;
        if (isDrawMode) {
            const targetPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            const { width, height } = RectangleClient.getRectangleByPoints([start!, targetPoint]);
            if (Math.hypot(width, height) === 0) {
                const pointer = PlaitBoard.getPointer(board) as DrawPointerType;
                if (pointer !== BasicShapes.text) {
                    const points = getDefaultGeometryPoints(pointer, targetPoint);
                    temporaryElement = createDefaultGeometry(board, points, pointer as GeometryShapes);
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
