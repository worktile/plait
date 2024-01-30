import {
    BoardTransforms,
    PRESS_AND_MOVE_BUFFER,
    PlaitBoard,
    PlaitOptionsBoard,
    PlaitPointerType,
    Point,
    RectangleClient,
    Transforms,
    addSelectedElement,
    clearSelectedElement,
    createG,
    distanceBetweenPointAndPoint,
    temporaryDisableSelection,
    toHostPoint,
    toViewBoxPoint
} from '@plait/core';
import { LineShape, PlaitDrawElement, PlaitLine, PlaitShape } from '../interfaces';
import { getShape } from '../utils/shape';
import { getEngine } from '../engines';
import { handleLineCreating } from '../utils/line/line-basic';
import { getSelectedDrawElements } from '../utils/selected';
import { getAutoCompletePoints, getHitIndexOfAutoCompletePoint } from '../utils/geometry';

export const WithLineAutoCompletePluginKey = 'plait-line-auto-complete-plugin-key';

export interface LineAutoCompleteOptions {
    afterComplete: (element: PlaitLine) => {};
}

export const withLineAutoComplete = (board: PlaitBoard) => {
    const { pointerDown, pointerMove, globalPointerUp } = board;

    let startPoint: Point | null = null;
    let lineShapeG: SVGGElement | null = null;
    let sourceElement: PlaitShape | null;
    let temporaryElement: PlaitLine | null;

    board.pointerDown = (event: PointerEvent) => {
        const selectedElements = getSelectedDrawElements(board);
        const targetElement = selectedElements.length === 1 && selectedElements[0];
        const clickPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        if (!PlaitBoard.isReadonly(board) && targetElement && PlaitDrawElement.isShape(targetElement)) {
            const points = getAutoCompletePoints(targetElement);
            const index = getHitIndexOfAutoCompletePoint(clickPoint, points);
            const hitPoint = points[index];
            if (hitPoint) {
                temporaryDisableSelection(board as PlaitOptionsBoard);
                startPoint = hitPoint;
                sourceElement = targetElement;
                BoardTransforms.updatePointerType(board, LineShape.elbow);
            }
        }
        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        lineShapeG?.remove();
        lineShapeG = createG();
        let movingPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        if (startPoint && sourceElement) {
            const distance = distanceBetweenPointAndPoint(...movingPoint, ...startPoint);
            if (distance > PRESS_AND_MOVE_BUFFER) {
                const rectangle = RectangleClient.getRectangleByPoints(sourceElement.points);
                const shape = getShape(sourceElement);
                const engine = getEngine(shape);
                let sourcePoint = startPoint;
                if (engine.getNearestCrossingPoint) {
                    const crossingPoint = engine.getNearestCrossingPoint(rectangle, startPoint);
                    sourcePoint = crossingPoint;
                }
                temporaryElement = handleLineCreating(board, LineShape.elbow, sourcePoint, movingPoint, sourceElement, lineShapeG);
            }
        }
        pointerMove(event);
    };

    board.globalPointerUp = event => {
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
        globalPointerUp(event);
    };

    return board;
};
