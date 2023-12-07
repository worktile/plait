import {
    BoardTransforms,
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
import { LineShape, PlaitDrawElement, PlaitGeometry, PlaitLine } from '../interfaces';
import { handleLineCreating, getAutoCompletePoints, getHitIndexOfAutoCompletePoint, getSelectedDrawElements } from '../utils';

export interface AutoCompleteOptions {
    afterComplete: (element: PlaitLine) => {};
}

export const withAutoCompletePluginKey = 'plait-auto-complete-plugin-key';

export const withAutoComplete = (board: PlaitBoard) => {
    const { pointerDown, pointerMove, pointerUp } = board;

    const tolerance = 3;
    let startPoint: Point | null = null;
    let lineShapeG: SVGGElement | null = null;
    let sourceElement: PlaitGeometry | null;
    let temporaryElement: PlaitLine | null;

    board.pointerDown = (event: PointerEvent) => {
        const selectedElements = getSelectedDrawElements(board);
        const clickPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        if (selectedElements.length === 1 && PlaitDrawElement.isGeometry(selectedElements[0])) {
            const points = getAutoCompletePoints(selectedElements[0]);
            const index = getHitIndexOfAutoCompletePoint(clickPoint, points);
            const hitPoint = points[index];
            if (hitPoint) {
                temporaryDisableSelection(board as PlaitOptionsBoard);
                startPoint = clickPoint;
                sourceElement = selectedElements[0];
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
            if (distance > tolerance) {
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
            const afterComplete = (board as PlaitOptionsBoard).getPluginOptions<AutoCompleteOptions>(withAutoCompletePluginKey)
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
