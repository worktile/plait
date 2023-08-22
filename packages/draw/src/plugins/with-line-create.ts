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
    toPoint,
    transformPoint
} from '@plait/core';
import { LineMarkerType, LineShape, PlaitLine } from '../interfaces';
import { DrawCreateMode, createLineElement, getCreateMode } from '../utils';
import { DrawPointerType } from '../constants';
import { DefaultLineStyle } from '../constants/line';
import { LineShapeGenerator } from '../generator/line.generator';

export const withLineCreateByDraw = (board: PlaitBoard) => {
    const { pointerDown, pointerMove, pointerUp } = board;
    let start: Point | null = null;

    let lineShapeG: SVGGElement | null = null;

    let temporaryElement: PlaitLine | null = null;

    board.pointerDown = (event: PointerEvent) => {
        const createMode = getCreateMode(board);

        const isLinePointer = PlaitBoard.isPointer(board, DrawPointerType.line);
        if (isLinePointer && createMode === DrawCreateMode.draw) {
            const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            start = point;
            preventTouchMove(board, true);
        }
        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        lineShapeG?.remove();
        lineShapeG = createG();

        if (start) {
            const lineGenerator = new LineShapeGenerator(board);
            const movingPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            temporaryElement = createLineElement(
                LineShape.elbow,
                [start, movingPoint],
                { marker: LineMarkerType.none },
                { marker: LineMarkerType.none },
                {
                    strokeColor: DefaultLineStyle.strokeColor,
                    strokeWidth: DefaultLineStyle.strokeWidth
                }
            );
            lineGenerator.draw(temporaryElement, lineShapeG);
            PlaitBoard.getElementActiveHost(board).append(lineShapeG);
        }

        pointerMove(event);
    };

    board.pointerUp = (event: PointerEvent) => {
        if (temporaryElement) {
            Transforms.insertNode(board, temporaryElement, [board.children.length]);
            clearSelectedElement(board);
            addSelectedElement(board, temporaryElement);
            BoardTransforms.updatePointerType(board, PlaitPointerType.selection);
        }

        lineShapeG?.remove();
        lineShapeG = null;
        start = null;
        temporaryElement = null;
        preventTouchMove(board, false);

        pointerUp(event);
    };

    return board;
};
