import {
    depthFirstRecursion,
    getIsRecursionFunc,
    isSelectedElement,
    PlaitBoard,
    PlaitElement,
    RectangleClient,
    throttleRAF,
    toHostPoint,
    toViewBoxPoint,
    Transforms
} from '@plait/core';
import { MindElement } from '../interfaces';
import { isHitMindElement } from '../utils';
import { PlaitCommonElementRef } from '@plait/common';
import { getCollapsedCenterPoint, NodeMoreGenerator } from '../generators/node-more.generator';
import { NODE_MORE_ICON_DIAMETER } from '../constants/default';

export interface NodeMoreRef {
    element: MindElement;
    isHovered: boolean;
    isHoveredCollapsedIcon: boolean;
}

export const withNodeMore = (board: PlaitBoard) => {
    const { pointerMove, pointerLeave, pointerDown } = board;
    let nodeMoreRef: NodeMoreRef | null = null;

    board.pointerMove = (event: PointerEvent) => {
        throttleRAF(board, 'with-mind-node-hover-hit-test', () => {
            // element has been deleted
            if (nodeMoreRef && !PlaitElement.hasMounted(nodeMoreRef.element)) {
                nodeMoreRef = null;
            }
            let target: MindElement | null = null;
            let isHovered = false;
            let isHoveredCollapsedIcon = false;
            const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            depthFirstRecursion(
                board as unknown as MindElement,
                (element) => {
                    if (target) {
                        return;
                    }
                    if (!MindElement.isMindElement(board, element)) {
                        return;
                    }
                    const isHitElement = isHitMindElement(board, point, element);
                    const collapsedCenterPoint = getCollapsedCenterPoint(board, element);
                    const collapsedIconRectangle = RectangleClient.getRectangleByCenterPoint(
                        collapsedCenterPoint,
                        NODE_MORE_ICON_DIAMETER,
                        NODE_MORE_ICON_DIAMETER
                    );
                    const isHitCollapsedIcon = RectangleClient.isHit(
                        RectangleClient.getRectangleByPoints([point, point]),
                        collapsedIconRectangle
                    );
                    if (isHitElement || isHitCollapsedIcon) {
                        isHovered = isHitElement;
                        isHoveredCollapsedIcon = isHitCollapsedIcon;
                        target = element;
                    }
                },
                getIsRecursionFunc(board),
                true
            );

            if (nodeMoreRef && target && nodeMoreRef.element === target) {
                return;
            }

            if (nodeMoreRef) {
                toggleHoveredNodeCallback(nodeMoreRef.element, false, false);
            }

            if (target) {
                toggleHoveredNodeCallback(target, isHovered, isHoveredCollapsedIcon);
                if (nodeMoreRef) {
                    nodeMoreRef.element = target;
                } else {
                    nodeMoreRef = { element: target, isHovered, isHoveredCollapsedIcon };
                }
            } else {
                nodeMoreRef = null;
            }
        });
        pointerMove(event);
    };

    board.pointerDown = (event: PointerEvent) => {
        if (nodeMoreRef && nodeMoreRef.isHoveredCollapsedIcon && !nodeMoreRef.element.isCollapsed) {
            const isCollapsed = !nodeMoreRef.element.isCollapsed;
            const newElement: Partial<MindElement> = { isCollapsed };
            const path = PlaitBoard.findPath(board, nodeMoreRef.element);
            Transforms.setNode(board, newElement, path);
        }
        pointerDown(event);
    };

    const toggleHoveredNodeCallback = (element: MindElement, isHovered: boolean, isHoveredCollapsedIcon: boolean) => {
        const elementRef = PlaitElement.getElementRef<PlaitCommonElementRef>(element);
        const nodeMoreGenerator = elementRef?.getGenerator(NodeMoreGenerator.key);
        if (nodeMoreGenerator && !isSelectedElement(board, element)) {
            const g = PlaitElement.getElementG(element);
            nodeMoreGenerator.processDrawing(element, g, {
                isHovered,
                isHoveredCollapsedIcon,
                isSelected: isSelectedElement(board, element),
                isAnimated: isHovered || isHoveredCollapsedIcon
            });
        }
    };

    board.pointerLeave = (event: PointerEvent) => {
        if (nodeMoreRef) {
            toggleHoveredNodeCallback(nodeMoreRef.element, false, false);
        }
        nodeMoreRef = null;
        pointerLeave(event);
    };

    return board;
};
