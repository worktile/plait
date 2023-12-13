import { PlaitBoard, PlaitElement, drawCircle, isSelectionMoving, toPoint, transformPoint } from '@plait/core';
import { PlaitDrawElement } from '../interfaces';
import { getAutoCompletePoints, getHitIndexOfAutoCompletePoint, getSelectedDrawElements } from '../utils';
import { GeometryComponent } from '../geometry.component';

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
                reactionG = drawCircle(PlaitBoard.getRoughSVG(board), hitPoint, 10, {
                    stroke: 'none',
                    fill: '#6698FF80',
                    fillStyle: 'solid'
                });
                PlaitBoard.getElementActiveHost(board).append(reactionG);
            }
        }
        pointerMove(event);
    };

    return board;
};
