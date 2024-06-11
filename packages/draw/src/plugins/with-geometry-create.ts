import { PlaitBoard, Point, RectangleClient, createG, preventTouchMove, toHostPoint, toViewBoxPoint } from '@plait/core';
import { BasicShapes, GeometryShapes, PlaitCommonGeometry, PlaitDrawElement, PlaitGeometry } from '../interfaces';
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
import {
    normalizeShapePoints,
    isDndMode,
    isDrawingMode,
    getDirectionFactorByDirectionComponent,
    getUnitVectorByPointAndPoint,
    TextManage
} from '@plait/common';
import { isKeyHotkey } from 'is-hotkey';
import { NgZone } from '@angular/core';
import { getSnapResizingRef } from '../utils/snap-resizing';
import { TableGenerator } from '../generators/table.generator';

export interface FakeCreateTextRef {
    g: SVGGElement;
    textManage: TextManage;
}

const isGeometryDndMode = (board: PlaitBoard) => {
    const geometryPointers = getGeometryPointers();
    const isGeometryPointer = PlaitBoard.isInPointer(board, geometryPointers);
    const dndMode = isGeometryPointer && isDndMode(board);
    return dndMode;
};

const isGeometryDrawingMode = (board: PlaitBoard) => {
    const geometryPointers = getGeometryPointers();
    const isGeometryPointer = PlaitBoard.isInPointer(board, geometryPointers);
    const drawingMode = isGeometryPointer && isDrawingMode(board);
    return drawingMode;
};

const getGeometryGeneratorByShape = (board: PlaitBoard, shape: DrawPointerType) => {
    if (PlaitDrawElement.isUMLClassOrInterface({ shape: shape })) {
        return new TableGenerator<PlaitGeometry>(board);
    } else {
        return new GeometryShapeGenerator(board);
    }
};

export const withGeometryCreateByDrag = (board: PlaitBoard) => {
    const { pointerMove, globalPointerUp, pointerUp } = board;

    let geometryShapeG: SVGGElement | null = null;

    let temporaryElement: PlaitCommonGeometry | null = null;

    let fakeCreateTextRef: FakeCreateTextRef | null = null;

    board.pointerMove = (event: PointerEvent) => {
        geometryShapeG?.remove();
        geometryShapeG = createG();

        const geometryPointers = getGeometryPointers();
        const isGeometryPointer = PlaitBoard.isInPointer(board, geometryPointers);
        const dragMode = isGeometryPointer && isDndMode(board);
        const movingPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        const pointer = PlaitBoard.getPointer(board) as DrawPointerType;
        const geometryGenerator = getGeometryGeneratorByShape(board, pointer);
        if (dragMode) {
            const memorizedLatest = getMemorizedLatestByPointer(pointer);
            if (pointer === BasicShapes.text) {
                const property = getTextShapeProperty(board, DefaultTextProperty.text, memorizedLatest.textProperties['font-size']);
                const points = RectangleClient.getPoints(
                    RectangleClient.getRectangleByCenterPoint(movingPoint, property.width, property.height)
                );
                temporaryElement = createTextElement(board, points);
                if (!fakeCreateTextRef) {
                    const textManage = new TextManage(board, {
                        getRectangle: () => {
                            return getTextRectangle(temporaryElement!);
                        }
                    });
                    textManage.draw(temporaryElement!.text);
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
                geometryGenerator.processDrawing(temporaryElement as PlaitGeometry, geometryShapeG);
                PlaitBoard.getElementActiveHost(board).append(geometryShapeG);
            }
        }

        pointerMove(event);
    };

    board.pointerUp = (event: PointerEvent) => {
        if (isGeometryDndMode(board) && temporaryElement) {
            return;
        }
        pointerUp(event);
    };

    board.globalPointerUp = (event: PointerEvent) => {
        if (isGeometryDndMode(board) && temporaryElement) {
            insertElement(board, temporaryElement);
            fakeCreateTextRef?.textManage.destroy();
            fakeCreateTextRef?.g.remove();
            fakeCreateTextRef = null;
        }
        temporaryElement = null;
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

    let temporaryElement: PlaitCommonGeometry | null = null;

    let isShift = false;

    let snapG: SVGGElement | null;

    board.keyDown = (event: KeyboardEvent) => {
        isShift = isKeyHotkey('shift', event);
        keyDown(event);
    };

    board.keyUp = (event: KeyboardEvent) => {
        isShift = false;
        keyUp(event);
    };

    board.pointerDown = (event: PointerEvent) => {
        if (!PlaitBoard.isReadonly(board) && isGeometryDrawingMode(board)) {
            const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            start = point;
            const pointer = PlaitBoard.getPointer(board) as DrawPointerType;
            preventTouchMove(board, event, true);
            if (pointer === BasicShapes.text) {
                const memorizedLatest = getMemorizedLatestByPointer(pointer);
                const property = getTextShapeProperty(board, DefaultTextProperty.text, memorizedLatest.textProperties['font-size']);
                const points = RectangleClient.getPoints(RectangleClient.getRectangleByCenterPoint(point, property.width, property.height));
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
        const movingPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        const pointer = PlaitBoard.getPointer(board) as DrawPointerType;
        const geometryGenerator = getGeometryGeneratorByShape(board, pointer);

        snapG?.remove();
        if (start && isGeometryDrawingMode(board)) {
            let points: [Point, Point] = normalizeShapePoints([start, movingPoint], isShift);
            const activeRectangle = RectangleClient.getRectangleByPoints(points);
            const [x, y] = getUnitVectorByPointAndPoint(start, movingPoint);
            const resizeSnapRef = getSnapResizingRef(board, [], {
                resizePoints: points,
                activeRectangle,
                directionFactors: [getDirectionFactorByDirectionComponent(x), getDirectionFactorByDirectionComponent(y)],
                isAspectRatio: isShift,
                isFromCorner: true,
                isCreate: true
            });
            snapG = resizeSnapRef.snapG;
            PlaitBoard.getElementActiveHost(board).append(snapG);
            points = normalizeShapePoints(resizeSnapRef.activePoints as [Point, Point], isShift);
            temporaryElement = createDefaultGeometry(board, points, pointer as GeometryShapes);
            geometryGenerator.processDrawing(temporaryElement as PlaitGeometry, geometryShapeG);
            PlaitBoard.getElementActiveHost(board).append(geometryShapeG);
        }
        pointerMove(event);
    };

    board.pointerUp = (event: PointerEvent) => {
        if (isGeometryDrawingMode(board) && start) {
            const targetPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            const { width, height } = RectangleClient.getRectangleByPoints([start!, targetPoint]);
            if (Math.hypot(width, height) < 8) {
                const pointer = PlaitBoard.getPointer(board) as DrawPointerType;
                if (pointer !== BasicShapes.text) {
                    const points = getDefaultGeometryPoints(pointer, targetPoint);
                    temporaryElement = createDefaultGeometry(board, points, pointer as GeometryShapes);
                }
            }
            if (temporaryElement) {
                insertElement(board, temporaryElement);
            }
            snapG?.remove();
            geometryShapeG?.remove();
            geometryShapeG = null;
            start = null;
            temporaryElement = null;
            preventTouchMove(board, event, false);
            return;
        }
        pointerUp(event);
    };
    return board;
};
