import {
    BOARD_TO_HOST,
    PlaitBoard,
    PlaitElement,
    PlaitPlugin,
    Point,
    Transforms,
    getSelectedElements,
    toPoint,
    transformPoint
} from '@plait/core';
import { AbstractNode, MindmapLayoutType, isHorizontalLayout } from '@plait/layouts';
import { MINDMAP_ELEMENT_TO_COMPONENT } from '../utils';
import { AbstractHandlePosition, MindElement } from '../interfaces';
import { MindmapQueries } from '../public-api';
import { findPositionLeftIndex, getHitAbstractHandle, getLocationScope } from '../utils/abstract';

export const withAbstract: PlaitPlugin = (board: PlaitBoard) => {
    const { mousedown, mousemove, mouseup } = board;
    let activeAbstractElement: PlaitElement | undefined;
    let abstractHandlePosition: AbstractHandlePosition | null;
    let startPoint: Point | undefined;
    let result: { end: number } | { start: number } | undefined;

    board.mousedown = (event: MouseEvent) => {
        const activeAbstractElements = getSelectedElements(board).filter(element => AbstractNode.isAbstract(element));
        const host = BOARD_TO_HOST.get(board);
        const point = transformPoint(board, toPoint(event.x, event.y, host!));

        activeAbstractElement = activeAbstractElements.find(element => {
            abstractHandlePosition = getHitAbstractHandle(board, element as MindElement, point);
            return abstractHandlePosition;
        });

        if (activeAbstractElement) {
            startPoint = point;
            return;
        }

        mousedown(event);
    };

    board.mousemove = (event: MouseEvent) => {
        getSelectedElements(board);
        const host = BOARD_TO_HOST.get(board);
        const endPoint = transformPoint(board, toPoint(event.x, event.y, host!));
        const abstractComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(activeAbstractElement as MindElement);
        if (abstractHandlePosition && abstractComponent) {
            const nodeLayout = MindmapQueries.getCorrectLayoutByElement(activeAbstractElement as MindElement) as MindmapLayoutType;
            const isHorizontal = isHorizontalLayout(nodeLayout);
            const parentElement = MindElement.getParent(abstractComponent.element);

            const resizingLocation = isHorizontal ? endPoint[1] : endPoint[0];
            const scope = getLocationScope(board, abstractHandlePosition, parentElement, abstractComponent.element, isHorizontal);
            const location = Math.min(scope.max, Math.max(scope.min, resizingLocation));

            const locationIndex = findPositionLeftIndex(board, parentElement, location, isHorizontal);
            result = abstractHandlePosition === AbstractHandlePosition.start ? { start: locationIndex + 1 } : { end: locationIndex };

            abstractComponent!.updateAbstractIncludedOutline(location, abstractHandlePosition);
        }
        mousemove(event);
    };

    board.mouseup = (event: MouseEvent) => {
        startPoint = undefined;
        abstractHandlePosition = null;
        if (result && activeAbstractElement) {
            const path = PlaitBoard.findPath(board, activeAbstractElement);
            Transforms.setNode(board, result, path);
        }
        mouseup(event);
    };
    return board;
};
