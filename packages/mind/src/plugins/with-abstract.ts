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
import { AbstractNode, LayoutNode, MindmapLayoutType, isHorizontalLayout, isStandardLayout } from '@plait/layouts';
import { AbstractHandlePosition, MindElement } from '../interfaces';
import { MindNodeComponent, MindmapQueries } from '../public-api';
import { findLocationLeftIndex, getHitAbstractHandle, getLocationScope } from '../utils/abstract/resize';
import { separateChildren } from '../utils/abstract/common';

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
            const abstractComponent = PlaitElement.getComponent(activeAbstractElement) as MindNodeComponent;
            const element = abstractComponent.element;
            const nodeLayout = MindmapQueries.getCorrectLayoutByElement(activeAbstractElement as MindElement) as MindmapLayoutType;
            const isHorizontal = isHorizontalLayout(nodeLayout);
            const parentElement = MindElement.getParent(element);

            let children = parentElement.children;

            const parentLayout = MindmapQueries.getLayoutByElement(parentElement);
            if (isStandardLayout(parentLayout)) {
                const rightNodeCount = parentElement.rightNodeCount!;
                const { leftChildren, rightChildren } = separateChildren(parentElement);
                if ((activeAbstractElement as MindElement).end! < rightNodeCount) {
                    children = rightChildren;
                }
                if ((activeAbstractElement as MindElement).start! >= rightNodeCount) {
                    children = leftChildren;
                }
            }

            const resizingLocation = isHorizontal ? endPoint[1] : endPoint[0];
            const parent = (MindElement.getNode(parentElement) as unknown) as LayoutNode;
            const scope = getLocationScope(board, abstractHandlePosition, children, element, parent, isHorizontal);
            const location = Math.min(scope.max, Math.max(scope.min, resizingLocation));

            let locationIndex = findLocationLeftIndex(board, children, location, isHorizontal);

            const isPropertyUnchanged =
                (abstractHandlePosition === AbstractHandlePosition.start &&
                    locationIndex + 1 === (activeAbstractElement as MindElement).start!) ||
                (abstractHandlePosition === AbstractHandlePosition.end && locationIndex === (activeAbstractElement as MindElement).end!);

            if (isPropertyUnchanged) {
                newProperty = undefined;
            } else {
                if (isStandardLayout(parent.layout)) {
                    const rightNodeCount = parent.origin.rightNodeCount;
                    let start = element.start!;
                    if (start >= rightNodeCount) {
                        locationIndex += rightNodeCount;
                    }
                }

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
                const abstractComponent = PlaitElement.getComponent(activeAbstractElement) as MindNodeComponent;
                abstractComponent!.updateAbstractIncludedOutline();
            }
        }
        mouseup(event);
    };
    return board;
};
