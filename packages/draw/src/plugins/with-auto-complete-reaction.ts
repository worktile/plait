import { PlaitBoard, PlaitElement, drawCircle, isSelectionMoving, toPoint, transformPoint } from '@plait/core';
import { PlaitDrawElement } from '../interfaces';
import { getSelectedDrawElements } from '../utils';
import { GeometryComponent } from '../geometry.component';
import { getAutoCompletePoints, getHitAutoCompletePoint } from '../generators/auto-complete.generator';

export const withAutoCompleteReaction = (board: PlaitBoard) => {
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
        if (selectedElements.length === 1 && PlaitDrawElement.isGeometry(selectedElements[0])) {
            const points = getAutoCompletePoints(selectedElements[0]);
            const hitIndex = getHitAutoCompletePoint(movingPoint, points);
            const hitPoint = points[hitIndex];
            const component = PlaitElement.getComponent(selectedElements[0]) as GeometryComponent;
            component.autoCompleteGenerator.recoverAutoCompleteG();
            if (hitPoint) {
                component.autoCompleteGenerator.removeAutoCompleteG(hitIndex);
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
