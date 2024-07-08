import {
    BoardTransforms,
    PlaitBoard,
    PlaitPointerType,
    Transforms,
    addSelectedElement,
    clearSelectedElement,
    createG,
    distanceBetweenPointAndPoint,
    getElementById,
    preventTouchMove,
    toHostPoint,
    toViewBoxPoint
} from '@plait/core';
import { PlaitVectorLine, VectorLineShape, VectorPenPointerType, VectorPenRef } from '../interfaces';
import { DrawPointerType, LINE_HIT_GEOMETRY_BUFFER, getVectorPenPointers } from '../constants';
import { isDrawingMode } from '@plait/common';
import { vectorLineCreating } from '../utils';
import { isKeyHotkey } from 'is-hotkey';

export const withVectorPenCreateByDraw = (board: PlaitBoard) => {
    const { pointerDown, pointerMove, dblClick, globalKeyDown } = board;

    let lineShapeG: SVGGElement | null = null;

    let temporaryElement: PlaitVectorLine | null = null;

    let vectorPenRef: VectorPenRef | null;

    const vectorLineComplete = () => {
        clearSelectedElement(board);
        if (vectorPenRef?.element) {
            addSelectedElement(board, vectorPenRef?.element);
        }
        lineShapeG?.remove();
        lineShapeG = null;
        vectorPenRef = null;
        temporaryElement = null;
    };

    board.pointerDown = (event: PointerEvent) => {
        const penPointers = getVectorPenPointers();
        const isVectorPenPointer = PlaitBoard.isInPointer(board, penPointers);

        if (isVectorPenPointer && !vectorPenRef) {
            vectorPenRef = { shape: VectorLineShape.straight };
        }

        if (!PlaitBoard.isReadonly(board) && vectorPenRef && isDrawingMode(board)) {
            let point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            if (!temporaryElement) {
                vectorPenRef = {
                    ...vectorPenRef,
                    start: point
                };
            } else {
                if (!vectorPenRef.element) {
                    vectorPenRef.element = temporaryElement;
                    Transforms.insertNode(board, vectorPenRef.element, [board.children.length]);
                } else {
                    const points = vectorPenRef.element.points;
                    const isClosed = distanceBetweenPointAndPoint(...point, ...vectorPenRef.start!) <= LINE_HIT_GEOMETRY_BUFFER;
                    if (isClosed) {
                        point = vectorPenRef.start!;
                    }
                    Transforms.setNode(board, { points: [...points, point] }, vectorPenRef.path!);
                    vectorPenRef.element = getElementById(board, vectorPenRef.element.id);
                    if (isClosed) {
                        vectorLineComplete();
                    }
                }
                preventTouchMove(board, event, true);
            }
        }
        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        lineShapeG?.remove();
        lineShapeG = createG();
        let movingPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        const pointer = PlaitBoard.getPointer(board) as DrawPointerType;
        if (pointer !== VectorPenPointerType.vectorPen) {
            vectorLineComplete();
        }
        if (vectorPenRef && vectorPenRef.start) {
            let drawPoints = [vectorPenRef.start];
            if (vectorPenRef.element) {
                drawPoints = [vectorPenRef.start, ...vectorPenRef.element.points];
                const path = PlaitBoard.findPath(board, vectorPenRef.element!);
                vectorPenRef.path = path;
            }
            const distance = distanceBetweenPointAndPoint(...movingPoint, ...vectorPenRef.start);
            if (distance <= LINE_HIT_GEOMETRY_BUFFER) {
                movingPoint = vectorPenRef.start;
            }
            temporaryElement = vectorLineCreating(board, vectorPenRef.shape, drawPoints, movingPoint, lineShapeG!);
        }
        pointerMove(event);
    };

    board.dblClick = (event: MouseEvent) => {
        if (!PlaitBoard.isReadonly(board)) {
            if (vectorPenRef && vectorPenRef.element) {
                Transforms.setNode(board, { points: vectorPenRef.element.points }, vectorPenRef.path!);
                vectorLineComplete();
                BoardTransforms.updatePointerType(board, PlaitPointerType.selection);
            }
        }
        dblClick(event);
    };

    board.globalKeyDown = (event: KeyboardEvent) => {
        if (!PlaitBoard.isReadonly(board)) {
            const isEsc = isKeyHotkey('esc', event);
            const isV = isKeyHotkey('v', event);
            if ((isEsc || isV) && vectorPenRef) {
                Transforms.setNode(board, { points: vectorPenRef.element?.points }, vectorPenRef.path!);
                vectorLineComplete();
                if (isV) {
                    BoardTransforms.updatePointerType(board, PlaitPointerType.selection);
                }
            }
        }
        globalKeyDown(event);
    };

    return board;
};
