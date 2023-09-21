import { ACTIVE_STROKE_WIDTH, PlaitBoard, RectangleClient, SELECTION_BORDER_COLOR, drawCircle, toPoint, transformPoint } from '@plait/core';
import { PlaitDrawElement } from '../interfaces';
import { drawBoundMask, getHitConnectorPoint, getNearestPoint } from '../utils';
import { DrawPointerType } from '../constants';
import { getRectangleByPoints, isResizingByCondition } from '@plait/common';
import { getHitOutlineGeometry } from '../utils/position/geometry';

export const withLineBoundReaction = (board: PlaitBoard) => {
    const { pointerMove, pointerUp } = board;

    let boundShapeG: SVGGElement | null = null;

    board.pointerMove = (event: PointerEvent) => {
        boundShapeG?.remove();
        const isLinePointer = PlaitBoard.isPointer(board, DrawPointerType.line);
        const movingPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        const isLineResizing = isResizingByCondition(board, element => PlaitDrawElement.isLine(element));

        if (isLinePointer || isLineResizing) {
            const hitElement = getHitOutlineGeometry(board, movingPoint, -4);
            if (hitElement) {
                boundShapeG = drawBoundMask(board, hitElement);
                let nearestPoint = getNearestPoint(hitElement, movingPoint, ACTIVE_STROKE_WIDTH);
                const rectangle = getRectangleByPoints(hitElement.points);
                const activeRectangle = RectangleClient.inflate(rectangle, ACTIVE_STROKE_WIDTH);
                const hitConnector = getHitConnectorPoint(nearestPoint, hitElement, activeRectangle);
                nearestPoint = hitConnector ? hitConnector : nearestPoint;
                const circleG = drawCircle(PlaitBoard.getRoughSVG(board), nearestPoint, 6, {
                    stroke: SELECTION_BORDER_COLOR,
                    strokeWidth: ACTIVE_STROKE_WIDTH,
                    fill: SELECTION_BORDER_COLOR,
                    fillStyle: 'solid'
                });
                boundShapeG.appendChild(circleG);
                PlaitBoard.getElementActiveHost(board).append(boundShapeG);
            }
        }

        pointerMove(event);
    };

    board.pointerUp = event => {
        boundShapeG?.remove();
        boundShapeG = null;

        pointerUp(event);
    };

    return board;
};
