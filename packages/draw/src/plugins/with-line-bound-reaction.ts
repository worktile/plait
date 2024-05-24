import {
    SNAPPING_STROKE_WIDTH,
    PlaitBoard,
    PlaitElement,
    RectangleClient,
    SELECTION_BORDER_COLOR,
    drawCircle,
    hasValidAngle,
    setAngleForG,
    toHostPoint,
    toViewBoxPoint
} from '@plait/core';
import { LineShape, PlaitDrawElement } from '../interfaces';
import { isResizingByCondition } from '@plait/common';
import { LineResizeHandle } from '../utils/position/line';
import { drawBoundReaction, getHitShape, getSnappingRef } from '../utils';

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
            const hitElement = getHitShape(board, movingPoint);
            if (hitElement) {
                const ref = getSnappingRef(board, hitElement, movingPoint);
                const isSnapping = ref.isHitEdge || ref.isHitConnector;
                boundShapeG = drawBoundReaction(board, hitElement, { hasMask: isSnapping, hasConnector: true });
                if (isSnapping) {
                    const circleG = drawCircle(PlaitBoard.getRoughSVG(board), ref.connectorPoint || ref.edgePoint, 6, {
                        stroke: SELECTION_BORDER_COLOR,
                        strokeWidth: SNAPPING_STROKE_WIDTH,
                        fill: SELECTION_BORDER_COLOR,
                        fillStyle: 'solid'
                    });
                    boundShapeG.appendChild(circleG);
                }
                if (hasValidAngle(hitElement)) {
                    setAngleForG(boundShapeG, RectangleClient.getCenterPointByPoints(hitElement.points), hitElement.angle!);
                }
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
