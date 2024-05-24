import {
    BoardTransforms,
    PlaitBoard,
    PlaitPointerType,
    Point,
    Transforms,
    addSelectedElement,
    clearSelectedElement,
    createG,
    preventTouchMove,
    toHostPoint,
    toViewBoxPoint
} from '@plait/core';
import { LineShape, PlaitLine, PlaitShapeElement } from '../interfaces';
import { getLinePointers } from '../constants';
import { isDrawingMode } from '@plait/common';
import { handleLineCreating } from '../utils/line/line-basic';
import { getSnappingShape } from '../utils';

export const withLineCreateByDraw = (board: PlaitBoard) => {
    const { pointerDown, pointerMove, globalPointerUp } = board;

    let start: Point | null = null;

    let sourceElement: PlaitShapeElement | null;

    let lineShapeG: SVGGElement | null = null;

    let temporaryElement: PlaitLine | null = null;

    board.pointerDown = (event: PointerEvent) => {
        const linePointers = getLinePointers();
        const isLinePointer = PlaitBoard.isInPointer(board, linePointers);
        if (!PlaitBoard.isReadonly(board) && isLinePointer && isDrawingMode(board)) {
            const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            start = point;
            const hitElement = getSnappingShape(board, point);
            if (hitElement) {
                sourceElement = hitElement;
            }
            preventTouchMove(board, event, true);
        }
        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        lineShapeG?.remove();
        lineShapeG = createG();
        let movingPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        if (start) {
            const lineShape = PlaitBoard.getPointer(board) as LineShape;
            temporaryElement = handleLineCreating(board, lineShape, start, movingPoint, sourceElement, lineShapeG);
        }

        pointerMove(event);
    };

    board.globalPointerUp = (event: PointerEvent) => {
        if (temporaryElement) {
            Transforms.insertNode(board, temporaryElement, [board.children.length]);
            clearSelectedElement(board);
            addSelectedElement(board, temporaryElement);
            BoardTransforms.updatePointerType(board, PlaitPointerType.selection);
        }
        lineShapeG?.remove();
        lineShapeG = null;
        sourceElement = null;
        start = null;
        temporaryElement = null;
        preventTouchMove(board, event, false);
        globalPointerUp(event);
    };

    return board;
};
