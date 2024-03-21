import {
    ACTIVE_STROKE_WIDTH,
    PlaitBoard,
    PlaitElement,
    RectangleClient,
    SELECTION_BORDER_COLOR,
    drawCircle,
    rotatePoints,
    setAngleForG,
    toHostPoint,
    toViewBoxPoint
} from '@plait/core';
import { LineShape, PlaitDrawElement } from '../interfaces';
import { isResizingByCondition } from '@plait/common';
import { getHitOutlineGeometry } from '../utils/position/geometry';
import { LineResizeHandle } from '../utils/position/line';
import { drawBoundMask, getNearestPoint } from '../utils/geometry';
import { getHitConnectorPoint } from '../utils/line/line-basic';

export const withLineBoundReaction = (board: PlaitBoard) => {
    const { pointerMove, pointerUp } = board;

    let boundShapeG: SVGGElement | null = null;

    board.pointerMove = (event: PointerEvent) => {
        boundShapeG?.remove();
        if (PlaitBoard.isReadonly(board)) {
            pointerMove(event);
            return;
        }
        const linePointers = Object.keys(LineShape);
        const isLinePointer = PlaitBoard.isInPointer(board, linePointers);
        const movingPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        const isLineResizing = isResizingByCondition<PlaitElement, LineResizeHandle>(board, resizeRef => {
            const { element, handle } = resizeRef;
            const isSourceOrTarget = handle === LineResizeHandle.target || handle === LineResizeHandle.source;
            return PlaitDrawElement.isLine(element) && isSourceOrTarget;
        });
        if (isLinePointer || isLineResizing) {
            const hitElement = getHitOutlineGeometry(board, movingPoint, -4);
            if (hitElement) {
                const rectangle = RectangleClient.getRectangleByPoints(hitElement.points);
                boundShapeG = drawBoundMask(board, hitElement);
                const [rotatedMovingPoint] = rotatePoints([movingPoint], RectangleClient.getCenterPoint(rectangle), -hitElement.angle);
                let nearestPoint = getNearestPoint(hitElement, rotatedMovingPoint);
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
                if (hitElement.angle) {
                    setAngleForG(boundShapeG, RectangleClient.getCenterPoint(rectangle), hitElement.angle);
                }
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
