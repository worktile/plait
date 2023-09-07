import { PlaitBoard, SELECTION_BORDER_COLOR, drawCircle, toPoint, transformPoint } from '@plait/core';
import { PlaitDrawElement } from '../interfaces';
import { drawBoundMask, normalizeHoverPoint } from '../utils';
import { DrawPointerType } from '../constants';
import { isResizingByCondition } from '@plait/common';
import { getStrokeWidthByElement } from '../utils/geometry-style/stroke';
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
                const offset = (getStrokeWidthByElement(board, hitElement) + 1) / 2;
                const nearestPoint = normalizeHoverPoint(hitElement, movingPoint, offset);
                const circleG = drawCircle(PlaitBoard.getRoughSVG(board), nearestPoint, 6, {
                    stroke: SELECTION_BORDER_COLOR,
                    strokeWidth: 1,
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
