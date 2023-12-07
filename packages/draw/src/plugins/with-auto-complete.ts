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
import { LineMarkerType, LineShape, PlaitDrawElement, PlaitGeometry, PlaitLine } from '../interfaces';
import {
    createLineElement,
    getAutoCompletePoints,
    getHitIndexOfAutoCompletePoint,
    getSelectedDrawElements,
    transformPointToConnection
} from '../utils';
import { getHitOutlineGeometry } from '../utils/position/geometry';
import { LineShapeGenerator } from '../generators/line.generator';
import { DefaultLineStyle } from '../constants/line';
import { REACTION_MARGIN } from '../constants';

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
        const movingPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        if (startPoint && sourceElement) {
            const distance = distanceBetweenPointAndPoint(...movingPoint, ...startPoint);
            if (distance > tolerance) {
                const hitElement = getHitOutlineGeometry(board, movingPoint, REACTION_MARGIN);
                const targetConnection = hitElement ? transformPointToConnection(board, movingPoint, hitElement) : undefined;
                const connection = transformPointToConnection(board, startPoint, sourceElement);
                const targetBoundId = hitElement ? hitElement.id : undefined;
                const lineGenerator = new LineShapeGenerator(board);
                temporaryElement = createLineElement(
                    LineShape.elbow,
                    [startPoint, movingPoint],
                    { marker: LineMarkerType.none, connection: connection, boundId: sourceElement!.id },
                    { marker: LineMarkerType.arrow, connection: targetConnection, boundId: targetBoundId },
                    [],
                    {
                        strokeColor: DefaultLineStyle.strokeColor,
                        strokeWidth: DefaultLineStyle.strokeWidth
                    }
                );
                lineGenerator.processDrawing(temporaryElement, lineShapeG);
                PlaitBoard.getElementActiveHost(board).append(lineShapeG);
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
