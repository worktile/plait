import {
    BoardTransforms,
    PRESS_AND_MOVE_BUFFER,
    PlaitBoard,
    PlaitOptionsBoard,
    PlaitPointerType,
    Point,
    Transforms,
    addSelectedElement,
    clearSelectedElement,
    createG,
    distanceBetweenPointAndPoint,
    temporaryDisableSelection,
    toPoint,
    transformPoint
} from '@plait/core';
import { LineShape, PlaitDrawElement, PlaitLine, PlaitShape } from '../interfaces';
import { handleLineCreating, getAutoCompletePoints, getHitIndexOfAutoCompletePoint, getSelectedDrawElements } from '../utils';

export const WithLineAutoCompletePluginKey = 'plait-line-auto-complete-plugin-key';

export interface LineAutoCompleteOptions {
    afterComplete: (element: PlaitLine) => {};
}

export const withLineAutoComplete = (board: PlaitBoard) => {
    const { pointerDown, pointerMove, pointerUp } = board;

    let startPoint: Point | null = null;
    let lineShapeG: SVGGElement | null = null;
    let sourceElement: PlaitShape | null;
    let temporaryElement: PlaitLine | null;

    board.pointerDown = (event: PointerEvent) => {
        const selectedElements = getSelectedDrawElements(board);
        const targetElement = selectedElements.length === 1 && selectedElements[0];
        const clickPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        if (!PlaitBoard.isReadonly(board) && targetElement && PlaitDrawElement.isShape(targetElement)) {
            const points = getAutoCompletePoints(targetElement);
            const index = getHitIndexOfAutoCompletePoint(clickPoint, points);
            const hitPoint = points[index];
            if (hitPoint) {
                temporaryDisableSelection(board as PlaitOptionsBoard);
                startPoint = clickPoint;
                sourceElement = targetElement;
                BoardTransforms.updatePointerType(board, LineShape.elbow);
            }
        }
        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        lineShapeG?.remove();
        lineShapeG = createG();
        let movingPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        if (startPoint && sourceElement) {
            const distance = distanceBetweenPointAndPoint(...movingPoint, ...startPoint);
            if (distance > PRESS_AND_MOVE_BUFFER) {
                temporaryElement = handleLineCreating(board, LineShape.elbow, startPoint, movingPoint, sourceElement, lineShapeG);
            }
        }

        pointerMove(event);
    };

    board.pointerUp = event => {
        if (temporaryElement) {
            Transforms.insertNode(board, temporaryElement, [board.children.length]);
            clearSelectedElement(board);
            addSelectedElement(board, temporaryElement);
            const afterComplete = (board as PlaitOptionsBoard).getPluginOptions<LineAutoCompleteOptions>(WithLineAutoCompletePluginKey)
                ?.afterComplete;
            afterComplete && afterComplete(temporaryElement);
        }
        if (startPoint) {
            BoardTransforms.updatePointerType(board, PlaitPointerType.selection);
            startPoint = null;
        }
        lineShapeG?.remove();
        lineShapeG = null;
        sourceElement = null;
        temporaryElement = null;
        pointerUp(event);
    };

    return board;
};
