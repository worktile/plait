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
import { getCollapseOrExpandCenterPoint, NodeMoreGenerator } from '../generators/node-more.generator';
import { NODE_MORE_ICON_DIAMETER } from '../constants/default';

export interface NodeMoreRef {
    target: MindElement;
    isHovered: boolean;
    isHoveredCollapseArea: boolean;
    isHoveredExpandArea: boolean;
}

export const withNodeMore = (board: PlaitBoard) => {
    const { pointerMove, pointerLeave, pointerUp } = board;
    let nodeMoreRef: NodeMoreRef | null = null;

    board.pointerMove = (event: PointerEvent) => {
        throttleRAF(board, 'with-mind-node-hover-hit-test', () => {
            // target has been deleted
            if (nodeMoreRef && !PlaitElement.hasMounted(nodeMoreRef.target)) {
                nodeMoreRef = null;
            }
            const newNodeMoreRef = getNodeMoreRef(board, event.x, event.y);

            if (nodeMoreRef && newNodeMoreRef && nodeMoreRef.target === newNodeMoreRef.target) {
                return;
            }

            if (nodeMoreRef) {
                toggleHoveredNodeCallback({
                    target: nodeMoreRef.target,
                    isHovered: false,
                    isHoveredCollapseArea: false,
                    isHoveredExpandArea: false
                });
            }

            if (newNodeMoreRef) {
                toggleHoveredNodeCallback(newNodeMoreRef);
                if (nodeMoreRef) {
                    nodeMoreRef.target = newNodeMoreRef.target;
                } else {
                    nodeMoreRef = newNodeMoreRef;
                }
            } else {
                nodeMoreRef = null;
            }
        });
        pointerMove(event);
    };

    board.pointerUp = (event: PointerEvent) => {
        if (nodeMoreRef && (nodeMoreRef.isHoveredCollapseArea || nodeMoreRef.isHoveredExpandArea)) {
            const isCollapsed = !nodeMoreRef.target.isCollapsed;
            const newElement: Partial<MindElement> = { isCollapsed };
            const path = PlaitBoard.findPath(board, nodeMoreRef.target);
            Transforms.setNode(board, newElement, path);
            setTimeout(() => {
                const newNodeMoreRef = getNodeMoreRef(board, event.x, event.y);
                if (newNodeMoreRef) {
                    toggleHoveredNodeCallback(newNodeMoreRef);
                    nodeMoreRef = newNodeMoreRef;
                } else {
                    nodeMoreRef = null;
                }
            }, 0);
            return;
        }
        pointerUp(event);
    };

    const toggleHoveredNodeCallback = (ref: NodeMoreRef) => {
        const elementRef = PlaitElement.getElementRef<PlaitCommonElementRef>(ref.target);
        const nodeMoreGenerator = elementRef?.getGenerator<NodeMoreGenerator>(NodeMoreGenerator.key);
        if (nodeMoreGenerator && !isSelectedElement(board, ref.target)) {
            const g = PlaitElement.getElementG(ref.target);
            nodeMoreGenerator.processDrawing(ref.target, g, {
                isHovered: ref.isHovered,
                isHoveredCollapseArea: ref.isHoveredCollapseArea,
                isHoveredExpandArea: ref.isHoveredExpandArea,
                isSelected: isSelectedElement(board, ref.target),
                isShowCollapseAnimation: ref.isHovered || ref.isHoveredCollapseArea
            });
        }
    };

    board.pointerLeave = (event: PointerEvent) => {
        if (nodeMoreRef) {
            toggleHoveredNodeCallback({
                target: nodeMoreRef.target,
                isHovered: false,
                isHoveredCollapseArea: false,
                isHoveredExpandArea: false
            });
        }
        nodeMoreRef = null;
        pointerLeave(event);
    };

    return board;
};

const getNodeMoreRef = (board: PlaitBoard, x: number, y: number) => {
    let target: MindElement | null = null;
    let isHovered = false;
    let isHoveredCollapseArea = false;
    let isHoveredExpandArea = false;
    const point = toViewBoxPoint(board, toHostPoint(board, x, y));
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
            const collapseOrExpandCenter = getCollapseOrExpandCenterPoint(board, element);
            const collapseOrExpandIconRectangle = RectangleClient.getRectangleByCenterPoint(
                collapseOrExpandCenter,
                NODE_MORE_ICON_DIAMETER,
                NODE_MORE_ICON_DIAMETER
            );
            const isHitCollapseOrExpand = RectangleClient.isHit(
                RectangleClient.getRectangleByPoints([point, point]),
                collapseOrExpandIconRectangle
            );
            if (isHitElement || isHitCollapseOrExpand) {
                isHovered = isHitElement;
                if (element.isCollapsed) {
                    isHoveredExpandArea = isHitCollapseOrExpand;
                } else {
                    isHoveredCollapseArea = isHitCollapseOrExpand;
                }
                target = element;
            }
        },
        getIsRecursionFunc(board),
        true
    );
    if (!target) {
        return null;
    }
    return {
        target,
        isHovered,
        isHoveredCollapseArea,
        isHoveredExpandArea
    } as NodeMoreRef;
};
