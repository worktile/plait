import { PlaitBoard, PlaitElement, RectangleClient, drawCircle, isSelectionMoving, toPoint, transformPoint } from '@plait/core';
import { PlaitDrawElement } from '../interfaces';
import { getSelectedDrawElements } from '../utils';
import { RESIZE_HANDLE_DIAMETER, getRectangleByPoints } from '@plait/common';
import { GeometryComponent } from '../geometry.component';
import { AutoCompleteMargin } from './with-auto-complete';

export const withAutoCompleteReaction = (board: PlaitBoard) => {
    const { pointerMove } = board;

    let reactionG: SVGGElement | null = null;

    board.pointerMove = (event: PointerEvent) => {
        reactionG?.remove();
        const selectedElements = getSelectedDrawElements(board);
        const movingPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        if (selectedElements.length === 1 && PlaitDrawElement.isGeometry(selectedElements[0])) {
            let rectangle = getRectangleByPoints(selectedElements[0].points);
            rectangle = RectangleClient.inflate(rectangle, AutoCompleteMargin);
            const centerPoints = RectangleClient.getEdgeCenterPoints(rectangle);
            const hitIndex = centerPoints.findIndex(point => {
                const movingRectangle = RectangleClient.toRectangleClient([movingPoint]);
                let rectangle = RectangleClient.toRectangleClient([point]);
                rectangle = RectangleClient.inflate(rectangle, RESIZE_HANDLE_DIAMETER);
                return RectangleClient.isHit(movingRectangle, rectangle);
            });
            const component = PlaitElement.getComponent(selectedElements[0]) as GeometryComponent;
            const hitPoint = centerPoints[hitIndex];
            if (!isSelectionMoving(board)) {
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
        }

        pointerMove(event);
    };

    return board;
};
