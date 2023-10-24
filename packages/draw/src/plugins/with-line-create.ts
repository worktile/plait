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
import { LineHandle, LineMarkerType, LineShape, PlaitGeometry, PlaitLine } from '../interfaces';
import { createLineElement, transformPointToConnection } from '../utils';
import { DrawPointerType } from '../constants';
import { DefaultLineStyle } from '../constants/line';
import { LineShapeGenerator } from '../generators/line.generator';
import { getHitOutlineGeometry } from '../utils/position/geometry';
import { isDrawingMode } from '@plait/common';

export const withLineCreateByDraw = (board: PlaitBoard) => {
    const { pointerDown, pointerMove, pointerUp } = board;

    let start: Point | null = null;

    let sourceRef: Partial<LineHandle> = {};

    let targetRef: Partial<LineHandle> = {};

    let lineShapeG: SVGGElement | null = null;

    let temporaryElement: PlaitLine | null = null;

    board.pointerDown = (event: PointerEvent) => {
        const isLinePointer = PlaitBoard.isPointer(board, LineShape.elbow);
        if (isLinePointer && isDrawingMode(board)) {
            const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            start = point;
            const hitElement = getHitOutlineGeometry(board, point, -4);
            if (hitElement) {
                sourceRef.connection = transformPointToConnection(board, point, hitElement);
                sourceRef.boundId = hitElement.id;
            }
            preventTouchMove(board, event, true);
        }
        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        lineShapeG?.remove();
        lineShapeG = createG();
        const movingPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        if (start) {
            const hitElement = getHitOutlineGeometry(board, movingPoint, -4);
            targetRef.connection = hitElement ? transformPointToConnection(board, movingPoint, hitElement) : undefined;
            targetRef.boundId = hitElement ? hitElement.id : undefined;
            const lineGenerator = new LineShapeGenerator(board);
            temporaryElement = createLineElement(
                LineShape.elbow,
                [start, movingPoint],
                { marker: LineMarkerType.none, connection: sourceRef.connection, boundId: sourceRef?.boundId },
                { marker: LineMarkerType.arrow, connection: targetRef.connection, boundId: targetRef?.boundId },
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
        sourceRef = {};
        targetRef = {};
        temporaryElement = null;
        preventTouchMove(board, event, false);

        pointerUp(event);
    };

    return board;
};
