import {
    BoardTransforms,
    PlaitBoard,
    PlaitPointerType,
    Point,
    Transforms,
    addSelectedElement,
    createG,
    distanceBetweenPointAndPoint,
    toHostPoint,
    toViewBoxPoint
} from '@plait/core';
import { PlaitVectorLine, VectorLineShape, VectorLinePointerType } from '../interfaces';
import { DrawPointerType, LINE_HIT_GEOMETRY_BUFFER, getVectorLinePointers } from '../constants';
import { isDrawingMode } from '@plait/common';
import { vectorLineCreating } from '../utils';
import { isKeyHotkey } from 'is-hotkey';

export const withVectorLineCreateByDraw = (board: PlaitBoard) => {
    const { pointerDown, pointerMove, dblClick, globalKeyDown } = board;

    let lineShapeG: SVGGElement | null = null;

    let temporaryElement: PlaitVectorLine | null = null;

    let drawPoints: Point[] = [];

    const vectorLineComplete = () => {
        if (temporaryElement) {
            Transforms.insertNode(board, temporaryElement, [board.children.length]);
        }
        PlaitBoard.getBoardContainer(board).classList.remove(`vector-line-closed`);
        lineShapeG?.remove();
        lineShapeG = null;
        temporaryElement = null;
        drawPoints = [];
    };

    board.pointerDown = (event: PointerEvent) => {
        const penPointers = getVectorLinePointers();
        const isVectorLinePointer = PlaitBoard.isInPointer(board, penPointers);
        if (!PlaitBoard.isReadonly(board) && isVectorLinePointer && isDrawingMode(board)) {
            let point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            if (drawPoints.length > 1) {
                const isClosed = distanceBetweenPointAndPoint(...point, ...drawPoints[0]) <= LINE_HIT_GEOMETRY_BUFFER;
                if (isClosed) {
                    drawPoints.push(drawPoints[0]);
                    vectorLineComplete();
                    return;
                }
            }
            drawPoints.push(point);
            return;
        }
        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        lineShapeG?.remove();
        lineShapeG = createG();
        let movingPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        const pointer = PlaitBoard.getPointer(board) as DrawPointerType;
        if (pointer === VectorLinePointerType.vectorLine) {
            if (drawPoints.length > 0) {
                const distance = distanceBetweenPointAndPoint(...movingPoint, ...drawPoints[0]);
                if (distance <= LINE_HIT_GEOMETRY_BUFFER) {
                    movingPoint = drawPoints[0];
                    PlaitBoard.getBoardContainer(board).classList.add(`vector-line-closed`);
                } else {
                    PlaitBoard.getBoardContainer(board).classList.remove(`vector-line-closed`);
                }
                temporaryElement = vectorLineCreating(board, VectorLineShape.straight, drawPoints, movingPoint, lineShapeG);
            }
        }
        pointerMove(event);
    };

    board.dblClick = (event: MouseEvent) => {
        console.log('l`ll be here');
        if (!PlaitBoard.isReadonly(board)) {
            if (temporaryElement) {
                vectorLineComplete();
                BoardTransforms.updatePointerType(board, PlaitPointerType.selection);
                return;
            }
        }
        dblClick(event);
    };

    board.globalKeyDown = (event: KeyboardEvent) => {
        if (!PlaitBoard.isReadonly(board)) {
            const isEsc = isKeyHotkey('esc', event);
            const isV = isKeyHotkey('v', event);
            if ((isEsc || isV) && temporaryElement) {
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
