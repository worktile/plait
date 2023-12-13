import { PlaitBoard, PlaitElement, RgbaToHEX, drawCircle, isSelectionMoving, toPoint, transformPoint } from '@plait/core';
import { PlaitDrawElement } from '../interfaces';
import { getAutoCompletePoints, getHitIndexOfAutoCompletePoint, getSelectedDrawElements } from '../utils';
import { GeometryComponent } from '../geometry.component';
import { PRIMARY_COLOR } from '@plait/common';
import { LINE_AUTO_COMPLETE_HOVERED_DIAMETER, LINE_AUTO_COMPLETE_HOVERED_OPACITY } from '../constants/line';

export const withLineAutoCompleteReaction = (board: PlaitBoard) => {
    const { pointerMove } = board;

    let reactionG: SVGGElement | null = null;

    board.pointerMove = (event: PointerEvent) => {
        reactionG?.remove();
        if (isSelectionMoving(board)) {
            pointerMove(event);
            return;
        }
        const selectedElements = getSelectedDrawElements(board);
        const movingPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        if (!PlaitBoard.isReadonly(board) && selectedElements.length === 1 && PlaitDrawElement.isGeometry(selectedElements[0])) {
            const points = getAutoCompletePoints(selectedElements[0]);
            const hitIndex = getHitIndexOfAutoCompletePoint(movingPoint, points);
            const hitPoint = points[hitIndex];
            const component = PlaitElement.getComponent(selectedElements[0]) as GeometryComponent;
            component.lineAutoCompleteGenerator!.recoverAutoCompleteG();
            if (hitPoint) {
                component.lineAutoCompleteGenerator!.removeAutoCompleteG(hitIndex);
                reactionG = drawCircle(PlaitBoard.getRoughSVG(board), hitPoint, LINE_AUTO_COMPLETE_HOVERED_DIAMETER, {
                    stroke: 'none',
                    fill: RgbaToHEX(PRIMARY_COLOR, LINE_AUTO_COMPLETE_HOVERED_OPACITY),
                    fillStyle: 'solid'
                });
                PlaitBoard.getElementActiveHost(board).append(reactionG);
            }
        }
        pointerMove(event);
    };

    return board;
};
