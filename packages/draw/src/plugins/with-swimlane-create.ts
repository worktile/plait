import { PlaitBoard, Point, RectangleClient, createG, preventTouchMove, toHostPoint, toViewBoxPoint } from '@plait/core';
import { PlaitSwimlane, SwimlaneDrawSymbols } from '../interfaces';
import { insertElement } from '../utils';
import { getSwimlanePointers } from '../constants';
import {
    normalizeShapePoints,
    isDndMode,
    isDrawingMode,
    getDirectionFactorByDirectionComponent,
    getUnitVectorByPointAndPoint,
    TextManage
} from '@plait/common';
import { isKeyHotkey } from 'is-hotkey';
import { getSnapResizingRef } from '../utils/snap-resizing';
import { TableGenerator } from '../generators/table.generator';
import { createDefaultSwimlane, getDefaultSwimlanePoints } from '../utils/swimlane';

export interface FakeCreateTextRef {
    g: SVGGElement;
    textManage: TextManage;
}

const isSwimlaneDndMode = (board: PlaitBoard) => {
    const swimlanePointers = getSwimlanePointers();
    const isSwimlanePointer = PlaitBoard.isInPointer(board, swimlanePointers);
    const dndMode = isSwimlanePointer && isDndMode(board);
    return dndMode;
};

const isSwimlaneDrawingMode = (board: PlaitBoard) => {
    const swimlanePointers = getSwimlanePointers();
    const isSwimlanePointer = PlaitBoard.isInPointer(board, swimlanePointers);
    const drawingMode = isSwimlanePointer && isDrawingMode(board);
    return drawingMode;
};

export const withSwimlaneCreateByDrag = (board: PlaitBoard) => {
    const { pointerMove, globalPointerUp, pointerUp } = board;

    let swimlaneG: SVGGElement | null = null;

    let temporaryElement: PlaitSwimlane | null = null;

    board.pointerMove = (event: PointerEvent) => {
        swimlaneG?.remove();
        swimlaneG = createG();

        const tableGenerator = new TableGenerator(board);
        const dragMode = isSwimlaneDndMode(board);
        const movingPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        const pointer = PlaitBoard.getPointer(board) as SwimlaneDrawSymbols;

        if (dragMode) {
            const points = getDefaultSwimlanePoints(pointer, movingPoint);
            temporaryElement = createDefaultSwimlane(pointer, points);
            tableGenerator.processDrawing(temporaryElement, swimlaneG);
            PlaitBoard.getElementActiveHost(board).append(swimlaneG);
        }

        pointerMove(event);
    };

    board.pointerUp = (event: PointerEvent) => {
        if (isSwimlaneDndMode(board) && temporaryElement) {
            return;
        }
        pointerUp(event);
    };

    board.globalPointerUp = (event: PointerEvent) => {
        if (isSwimlaneDndMode(board) && temporaryElement) {
            insertElement(board, temporaryElement);
        }
        temporaryElement = null;
        swimlaneG?.remove();
        swimlaneG = null;
        preventTouchMove(board, event, false);
        globalPointerUp(event);
    };

    return board;
};

export const withSwimlaneCreateByDrawing = (board: PlaitBoard) => {
    const { pointerDown, pointerMove, pointerUp, keyDown, keyUp } = board;
    let start: Point | null = null;

    let swimlaneG: SVGGElement | null = null;

    let temporaryElement: PlaitSwimlane | null = null;

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
        if (!PlaitBoard.isReadonly(board) && isSwimlaneDrawingMode(board)) {
            const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            start = point;
        }
        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        swimlaneG?.remove();
        swimlaneG = createG();
        const tableGenerator = new TableGenerator(board);
        const movingPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        const pointer = PlaitBoard.getPointer(board) as SwimlaneDrawSymbols;
        snapG?.remove();
        if (start && isSwimlaneDrawingMode(board)) {
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
            temporaryElement = createDefaultSwimlane(pointer, points);
            tableGenerator.processDrawing(temporaryElement, swimlaneG);
            PlaitBoard.getElementActiveHost(board).append(swimlaneG);
        }
        pointerMove(event);
    };

    board.pointerUp = (event: PointerEvent) => {
        if (isSwimlaneDrawingMode(board) && start) {
            const targetPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            const { width, height } = RectangleClient.getRectangleByPoints([start!, targetPoint]);
            if (Math.hypot(width, height) < 8) {
                const pointer = PlaitBoard.getPointer(board) as SwimlaneDrawSymbols;
                const points = getDefaultSwimlanePoints(pointer, targetPoint);
                temporaryElement = createDefaultSwimlane(pointer, points);
            }
            if (temporaryElement) {
                insertElement(board, temporaryElement);
            }
            snapG?.remove();
            swimlaneG?.remove();
            swimlaneG = null;
            start = null;
            temporaryElement = null;
            preventTouchMove(board, event, false);
            return;
        }
        pointerUp(event);
    };
    return board;
};
