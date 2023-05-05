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
import { AbstractHandlePosition, MindElement } from '../interfaces';
import { MindmapNodeComponent, MindmapQueries } from '../public-api';
import { findLocationLeftIndex, getHitAbstractHandle, getLocationScope } from '../utils/abstract-resize';

export const withAbstract: PlaitPlugin = (board: PlaitBoard) => {
    const { mousedown, mousemove, mouseup } = board;
    let activeAbstractElement: PlaitElement | undefined;
    let abstractHandlePosition: AbstractHandlePosition | null;
    let startPoint: Point | undefined;
    let newProperty: { end: number } | { start: number } | undefined;

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

        if (abstractHandlePosition && activeAbstractElement) {
            const abstractComponent = PlaitElement.getComponent(activeAbstractElement) as MindmapNodeComponent;
            const nodeLayout = MindmapQueries.getCorrectLayoutByElement(activeAbstractElement as MindElement) as MindmapLayoutType;
            const isHorizontal = isHorizontalLayout(nodeLayout);
            const parentElement = MindElement.getParent(abstractComponent.element);

            const resizingLocation = isHorizontal ? endPoint[1] : endPoint[0];
            const scope = getLocationScope(board, abstractHandlePosition, parentElement, abstractComponent.element, isHorizontal);
            const location = Math.min(scope.max, Math.max(scope.min, resizingLocation));

            const locationIndex = findLocationLeftIndex(board, parentElement, location, isHorizontal);
            const isPropertyUnchanged =
                (abstractHandlePosition === AbstractHandlePosition.start &&
                    locationIndex === (activeAbstractElement as MindElement).start!) ||
                (abstractHandlePosition === AbstractHandlePosition.end && locationIndex === (activeAbstractElement as MindElement).end!);

            if (isPropertyUnchanged) {
                newProperty = undefined;
            } else {
                newProperty =
                    abstractHandlePosition === AbstractHandlePosition.start ? { start: locationIndex + 1 } : { end: locationIndex };
            }

            abstractComponent!.updateAbstractIncludedOutline(location, abstractHandlePosition);
        }
        mousemove(event);
    };

    board.mouseup = (event: MouseEvent) => {
        startPoint = undefined;
        abstractHandlePosition = null;
        if (activeAbstractElement) {
            if (newProperty) {
                const path = PlaitBoard.findPath(board, activeAbstractElement);
                Transforms.setNode(board, newProperty, path);
            } else {
                const abstractComponent = PlaitElement.getComponent(activeAbstractElement) as MindmapNodeComponent;
                abstractComponent!.updateAbstractIncludedOutline();
            }
        }
        mouseup(event);
    };
    return board;
};
