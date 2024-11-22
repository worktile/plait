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
    toHostPoint,
    toViewBoxPoint
} from '@plait/core';
import { PlaitVectorLine, VectorLineShape, VectorPenPointerType, VectorLineRef } from '../interfaces';
import { DrawPointerType, LINE_HIT_GEOMETRY_BUFFER, getVectorPenPointers } from '../constants';
import { isDrawingMode } from '@plait/common';
import { vectorLineCreating } from '../utils';
import { isKeyHotkey } from 'is-hotkey';

export const withVectorLineCreateByDraw = (board: PlaitBoard) => {
    const { pointerDown, pointerMove, dblClick, globalKeyDown } = board;

    let lineShapeG: SVGGElement | null = null;

    let temporaryElement: PlaitVectorLine | null = null;

    let vectorLineRef: VectorLineRef | null;

    const vectorLineComplete = () => {
        if (vectorLineRef) {
            clearSelectedElement(board);
            if (vectorLineRef?.element) {
                addSelectedElement(board, vectorLineRef?.element);
            }
        }
        PlaitBoard.getBoardContainer(board).classList.remove(`vector-line-closed`);
        lineShapeG?.remove();
        lineShapeG = null;
        vectorLineRef = null;
        temporaryElement = null;
    };

    board.pointerDown = (event: PointerEvent) => {
        const penPointers = getVectorPenPointers();
        const isVectorPenPointer = PlaitBoard.isInPointer(board, penPointers);

        if (isVectorPenPointer && !vectorLineRef) {
            vectorLineRef = { shape: VectorLineShape.straight };
        }

        if (!PlaitBoard.isReadonly(board) && vectorLineRef && isDrawingMode(board)) {
            let point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            if (!temporaryElement) {
                vectorLineRef = {
                    ...vectorLineRef,
                    start: point
                };
            } else {
                if (!vectorLineRef.element) {
                    vectorLineRef.element = temporaryElement;
                    Transforms.insertNode(board, vectorLineRef.element, [board.children.length]);
                } else {
                    let points = vectorLineRef.element.points;
                    const isClosed = distanceBetweenPointAndPoint(...point, ...vectorLineRef.start!) <= LINE_HIT_GEOMETRY_BUFFER;
                    if (isClosed) {
                        point = vectorLineRef.start!;
                    }
                    if (vectorLineRef.path) {
                        const lastPoint = points[points.length - 1];
                        const distance = distanceBetweenPointAndPoint(...point, ...lastPoint);
                        if (distance > 2) {
                            Transforms.setNode(board, { points: [...points, point] }, vectorLineRef.path);
                        }
                    }
                    vectorLineRef.element = getElementById(board, vectorLineRef.element.id);
                    if (isClosed) {
                        vectorLineComplete();
                    }
                }
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
        if (vectorLineRef && vectorLineRef.start) {
            let drawPoints = [vectorLineRef.start];
            if (vectorLineRef.element) {
                drawPoints = [vectorLineRef.start, ...vectorLineRef.element.points];
                const path = PlaitBoard.findPath(board, vectorLineRef.element!);
                vectorLineRef.path = path;
            }
            const distance = distanceBetweenPointAndPoint(...movingPoint, ...vectorLineRef.start);
            if (distance <= LINE_HIT_GEOMETRY_BUFFER) {
                movingPoint = vectorLineRef.start;
                PlaitBoard.getBoardContainer(board).classList.add(`vector-line-closed`);
            } else {
                PlaitBoard.getBoardContainer(board).classList.remove(`vector-line-closed`);
            }
            temporaryElement = vectorLineCreating(board, vectorLineRef.shape, drawPoints, movingPoint, lineShapeG);
        }
        pointerMove(event);
    };

    board.dblClick = (event: MouseEvent) => {
        if (!PlaitBoard.isReadonly(board)) {
            if (vectorLineRef) {
                if (vectorLineRef.path) {
                    Transforms.setNode(board, { points: vectorLineRef?.element?.points }, vectorLineRef.path);
                }
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
            if ((isEsc || isV) && vectorLineRef) {
                if (vectorLineRef.path) {
                    Transforms.setNode(board, { points: vectorLineRef.element?.points }, vectorLineRef.path);
                }
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
