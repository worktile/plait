import { CursorClass, PlaitBoard, PlaitElement, RgbaToHEX, drawCircle, isSelectionMoving, toHostPoint, toViewBoxPoint } from '@plait/core';
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
        PlaitBoard.getBoardContainer(board).classList.remove(CursorClass.crosshair);
        const selectedElements = getSelectedDrawElements(board);
        const targetElement = selectedElements.length === 1 && selectedElements[0];
        const movingPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        if (!PlaitBoard.isReadonly(board) && !isSelectionMoving(board) && targetElement && PlaitDrawElement.isShape(targetElement)) {
            const points = getAutoCompletePoints(targetElement);
            const hitIndex = getHitIndexOfAutoCompletePoint(movingPoint, points);
            const hitPoint = points[hitIndex];
            const component = PlaitElement.getComponent(targetElement) as GeometryComponent;
            component.lineAutoCompleteGenerator!.recoverAutoCompleteG();
            if (hitPoint) {
                component.lineAutoCompleteGenerator!.removeAutoCompleteG(hitIndex);
                reactionG = drawCircle(PlaitBoard.getRoughSVG(board), hitPoint, LINE_AUTO_COMPLETE_HOVERED_DIAMETER, {
                    stroke: 'none',
                    fill: RgbaToHEX(PRIMARY_COLOR, LINE_AUTO_COMPLETE_HOVERED_OPACITY),
                    fillStyle: 'solid'
                });
                PlaitBoard.getElementActiveHost(board).append(reactionG);
                PlaitBoard.getBoardContainer(board).classList.add(CursorClass.crosshair);
            }
        }
        pointerMove(event);
    };

    return board;
};
