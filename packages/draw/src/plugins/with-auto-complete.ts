import {
    BoardTransforms,
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
    toPoint,
    transformPoint
} from '@plait/core';
import { LineMarkerType, LineShape, PlaitDrawElement, PlaitGeometry, PlaitLine } from '../interfaces';
import { createLineElement, getSelectedDrawElements, transformPointToConnection } from '../utils';
import { RESIZE_HANDLE_DIAMETER, getRectangleByPoints } from '@plait/common';
import { getHitOutlineGeometry } from '../utils/position/geometry';
import { LineShapeGenerator } from '../generators/line.generator';
import { DefaultLineStyle } from '../constants/line';

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
            let rectangle = getRectangleByPoints(selectedElements[0].points);
            rectangle = RectangleClient.inflate(rectangle, (12 + RESIZE_HANDLE_DIAMETER / 2) * 2 + 1);
            const centerPoints = RectangleClient.getEdgeCenterPoints(rectangle);
            const hitPoint = centerPoints.find(point => {
                const movingRectangle = RectangleClient.toRectangleClient([clickPoint]);
                let rectangle = RectangleClient.toRectangleClient([point]);
                rectangle = RectangleClient.inflate(rectangle, RESIZE_HANDLE_DIAMETER);
                return RectangleClient.isHit(movingRectangle, rectangle);
            });
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
                const hitElement = getHitOutlineGeometry(board, movingPoint, -4);
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
                lineGenerator.draw(temporaryElement, lineShapeG);
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
        }
        lineShapeG?.remove();
        lineShapeG = null;
        sourceElement = null;
        temporaryElement = null;
        BoardTransforms.updatePointerType(board, PlaitPointerType.selection);
        pointerUp(event);
    };

    return board;
};
