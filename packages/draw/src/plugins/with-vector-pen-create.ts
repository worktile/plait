import {
    BoardTransforms,
    PlaitBoard,
    PlaitPointerType,
    Point,
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
    const { pointerDown, pointerMove, dblClick, globalKeyDown, globalPointerUp } = board;

    let lineShapeG: SVGGElement | null = null;

    let temporaryElement: PlaitVectorLine | null = null;

    let vectorPenRef: VectorPenRef | null;

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
                vectorPenRef.element = getElementById(board, temporaryElement.id);
                const isClosed = distanceBetweenPointAndPoint(...point, ...vectorPenRef.start!) <= LINE_HIT_GEOMETRY_BUFFER;
                if (isClosed) {
                    vectorPenRef = null;
                    temporaryElement = null;
                }
            }

            preventTouchMove(board, event, true);
        }
        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        lineShapeG?.remove();
        lineShapeG = createG();
        let movingPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        const pointer = PlaitBoard.getPointer(board) as DrawPointerType;
        if (pointer !== VectorPenPointerType.vectorPen) {
            if (vectorPenRef && vectorPenRef.element) {
                const points = vectorPenRef.element!.points;
                Transforms.setNode(board, { points: [...points.slice(0, points.length)] }, vectorPenRef.path!);
                vectorPenRef = null;
                temporaryElement = null;
            }
        }
        if (vectorPenRef) {
            if (vectorPenRef.start && !vectorPenRef.element) {
                temporaryElement = vectorLineCreating(board, vectorPenRef.shape, vectorPenRef.start, movingPoint, lineShapeG);
                vectorPenRef.element = temporaryElement;
                Transforms.insertNode(board, temporaryElement, [board.children.length]);
            } else {
                const path = PlaitBoard.findPath(board, vectorPenRef.element!);
                vectorPenRef.path = path;
                const distance = distanceBetweenPointAndPoint(...movingPoint, ...vectorPenRef.start!);
                if (distance <= LINE_HIT_GEOMETRY_BUFFER) {
                    movingPoint = vectorPenRef.start!;
                }
                let points = vectorPenRef.element!.points;

                if (Point.isEquals(points[0], points[1])) {
                    points = points.slice(1);
                }
                Transforms.setNode(board, { points: [...points, movingPoint] }, vectorPenRef.path!);
            }
        }
        pointerMove(event);
    };

    board.dblClick = (event: MouseEvent) => {
        if (!PlaitBoard.isReadonly(board)) {
            if (vectorPenRef && vectorPenRef.element) {
                Transforms.setNode(board, { points: vectorPenRef.element.points }, vectorPenRef.path!);
                vectorPenRef = null;
                temporaryElement = null;
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
                const points = vectorPenRef.element!.points;
                Transforms.setNode(board, { points: [...points.slice(0, points.length)] }, vectorPenRef.path!);
                vectorPenRef = null;
                temporaryElement = null;
                if (isV) {
                    BoardTransforms.updatePointerType(board, PlaitPointerType.selection);
                }
            }
        }
        globalKeyDown(event);
    };

    board.globalPointerUp = (event: PointerEvent) => {
        if (vectorPenRef && vectorPenRef.element) {
            clearSelectedElement(board);
            addSelectedElement(board, vectorPenRef.element);
        }

        lineShapeG?.remove();
        lineShapeG = null;
        preventTouchMove(board, event, false);
        globalPointerUp(event);
    };

    return board;
};
