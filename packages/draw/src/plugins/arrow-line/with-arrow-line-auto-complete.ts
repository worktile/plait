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
    rotateAntiPointsByElement,
    rotatePointsByElement,
    temporaryDisableSelection,
    toActivePoint,
    toHostPoint,
    toScreenPointFromActivePoint,
    toViewBoxPoint
} from '@plait/core';
import { ArrowLineShape, PlaitArrowLine, PlaitDrawElement, PlaitGeometry, PlaitShapeElement } from '../../interfaces';
import { getElementShape } from '../../utils/shape';
import { getEngine } from '../../engines';
import { handleArrowLineCreating } from '../../utils/arrow-line/arrow-line-basic';
import { getSelectedDrawElements } from '../../utils/selected';
import { getAutoCompletePoints, getHitIndexOfAutoCompletePoint } from '../../utils/geometry';
import { insertElement } from '../../utils';

export const WithArrowLineAutoCompletePluginKey = 'plait-arrow-line-auto-complete-plugin-key';

export interface ArrowLineAutoCompleteOptions {
    afterComplete: (element: PlaitArrowLine) => {};
}

export type PreCommitRef = { temporaryArrowLineElement: PlaitArrowLine; temporaryShapeElement: PlaitGeometry };

export const BOARD_TO_PRE_COMMIT = new WeakMap<PlaitBoard, PreCommitRef>();

export const withArrowLineAutoComplete = (board: PlaitBoard) => {
    const { pointerDown, pointerMove, globalPointerUp } = board;

    let autoCompletePoint: Point | null = null;
    let lineShapeG: SVGGElement | null = null;
    let sourceElement: PlaitShapeElement | null;
    let temporaryElement: PlaitArrowLine | null;

    board.pointerDown = (event: PointerEvent) => {
        const selectedElements = getSelectedDrawElements(board);
        const targetElement = selectedElements.length === 1 && selectedElements[0];
        const activePoint = toActivePoint(board, event.x, event.y);
        if (!PlaitBoard.isReadonly(board) && targetElement && PlaitDrawElement.isShapeElement(targetElement)) {
            const points = getAutoCompletePoints(board, targetElement, true);
            const index = getHitIndexOfAutoCompletePoint(
                rotateAntiPointsByElement(board, activePoint, targetElement, true) || activePoint,
                points
            );
            const hitPoint = points[index];
            if (hitPoint) {
                temporaryDisableSelection(board as PlaitOptionsBoard);
                const screenPoint = toScreenPointFromActivePoint(board, hitPoint);
                autoCompletePoint = toViewBoxPoint(board, toHostPoint(board, screenPoint[0], screenPoint[1]));
                sourceElement = targetElement;
                BoardTransforms.updatePointerType(board, ArrowLineShape.elbow);
            }
        }
        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        lineShapeG?.remove();
        lineShapeG = createG();
        let movingPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        if (autoCompletePoint && sourceElement) {
            const distance = distanceBetweenPointAndPoint(
                ...(rotateAntiPointsByElement(board, movingPoint, sourceElement) || movingPoint),
                ...autoCompletePoint
            );
            if (distance > PRESS_AND_MOVE_BUFFER * 2) {
                const rectangle = RectangleClient.getRectangleByPoints(sourceElement.points);
                const shape = getElementShape(sourceElement);
                const engine = getEngine(shape);
                let sourcePoint = autoCompletePoint;
                if (engine.getNearestCrossingPoint) {
                    const crossingPoint = engine.getNearestCrossingPoint(rectangle, autoCompletePoint);
                    sourcePoint = crossingPoint;
                }
                // source point must be click point
                const rotatedSourcePoint = rotatePointsByElement(sourcePoint, sourceElement) || sourcePoint;
                temporaryElement = handleArrowLineCreating(
                    board,
                    ArrowLineShape.elbow,
                    rotatedSourcePoint,
                    movingPoint,
                    sourceElement,
                    lineShapeG
                );
                Transforms.addSelectionWithTemporaryElements(board, []);
            }
        }
        pointerMove(event);
    };

    board.globalPointerUp = (event) => {
        if (temporaryElement) {
            Transforms.insertNode(board, temporaryElement, [board.children.length]);
            clearSelectedElement(board);
            addSelectedElement(board, temporaryElement);
            const afterComplete = (board as PlaitOptionsBoard).getPluginOptions<ArrowLineAutoCompleteOptions>(
                WithArrowLineAutoCompletePluginKey
            )?.afterComplete;
            afterComplete && afterComplete(temporaryElement);
        } else {
            const preCommitRef = BOARD_TO_PRE_COMMIT.get(board);
            if (preCommitRef) {
                Transforms.insertNode(board, preCommitRef.temporaryArrowLineElement, [board.children.length]);
                insertElement(board, preCommitRef.temporaryShapeElement);
                BOARD_TO_PRE_COMMIT.delete(board);
            }
        }
        if (autoCompletePoint) {
            BoardTransforms.updatePointerType(board, PlaitPointerType.selection);
            autoCompletePoint = null;
        }
        lineShapeG?.remove();
        lineShapeG = null;
        sourceElement = null;
        temporaryElement = null;
        globalPointerUp(event);
    };

    return board;
};
