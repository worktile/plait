import {
    depthFirstRecursion,
    getElementById,
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
import { findNewChildNodePath, insertMindElement, isHitMindElement } from '../utils';
import { PlaitCommonElementRef } from '@plait/common';
import { canHandleNodeMore, getNodeMoreKeyPosition, NodeMoreGenerator } from '../generators/node-more.generator';
import { NODE_MORE_ICON_DIAMETER } from '../constants/default';
import { PlaitMindBoard } from './with-mind.board';

export interface NodeMoreRef {
    target: MindElement;
    isHovered: boolean;
    isHoveredAwarenessRectangle: boolean;
    isHoveredCollapseArea: boolean;
    isHoveredExpandArea: boolean;
    isHoveredAddArea: boolean;
}

export const isSameNodeMoreRef = (ref1: NodeMoreRef | null, ref2: NodeMoreRef | null) => {
    if (!ref1 || !ref2) {
        return false;
    }
    const result =
        ref1.target === ref2.target &&
        ref1.isHovered === ref2.isHovered &&
        ref1.isHoveredAwarenessRectangle === ref2.isHoveredAwarenessRectangle &&
        ref1.isHoveredCollapseArea === ref2.isHoveredCollapseArea &&
        ref1.isHoveredExpandArea === ref2.isHoveredExpandArea &&
        ref1.isHoveredAddArea === ref2.isHoveredAddArea;
    return result;
};

export const withNodeMore = (board: PlaitBoard) => {
    const { pointerMove, pointerLeave, pointerUp } = board;
    let nodeMoreRef: NodeMoreRef | null = null;

    board.pointerMove = (event: PointerEvent) => {
        if (canHandleNodeMore(board)) {
            throttleRAF(board, 'with-mind-node-hover-hit-test', () => {
                // target has been deleted
                if (nodeMoreRef && !PlaitElement.hasMounted(nodeMoreRef.target)) {
                    nodeMoreRef = null;
                }
                const newNodeMoreRef = getNodeMoreRef(board, event.x, event.y);
                if (nodeMoreRef && newNodeMoreRef && isSameNodeMoreRef(nodeMoreRef, newNodeMoreRef)) {
                    return;
                }
                if (nodeMoreRef && (!newNodeMoreRef || newNodeMoreRef.target !== nodeMoreRef.target)) {
                    const element = getElementById<MindElement>(board, nodeMoreRef.target.id);
                    // maybe element has been changed
                    if (element && element === nodeMoreRef.target) {
                        toggleHoveredNodeCallback({
                            target: nodeMoreRef.target,
                            isHovered: false,
                            isHoveredAwarenessRectangle: false,
                            isHoveredCollapseArea: false,
                            isHoveredExpandArea: false,
                            isHoveredAddArea: false
                        });
                    }
                }
                if (newNodeMoreRef) {
                    toggleHoveredNodeCallback(newNodeMoreRef, nodeMoreRef);
                    nodeMoreRef = newNodeMoreRef;
                } else if (nodeMoreRef) {
                    nodeMoreRef = null;
                }
            });
        }
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
        if (nodeMoreRef && nodeMoreRef.isHoveredAddArea && !PlaitBoard.isReadonly(board)) {
            if (nodeMoreRef) {
                const path = findNewChildNodePath(board, nodeMoreRef.target);
                insertMindElement(board as PlaitMindBoard, nodeMoreRef.target, path);
            }
            return;
        }
        pointerUp(event);
    };

    const toggleHoveredNodeCallback = (ref: NodeMoreRef, oldRef?: NodeMoreRef | null) => {
        const elementRef = PlaitElement.getElementRef<PlaitCommonElementRef>(ref.target);
        const nodeMoreGenerator = elementRef?.getGenerator<NodeMoreGenerator>(NodeMoreGenerator.key);
        if (nodeMoreGenerator) {
            const isSameTarget = oldRef?.target === ref.target;
            const g = PlaitElement.getElementG(ref.target);
            nodeMoreGenerator.processDrawing(ref.target, g, {
                isHovered: ref.isHovered,
                isHoveredAwarenessRectangle: ref.isHoveredAwarenessRectangle,
                isHoveredCollapseArea: ref.isHoveredCollapseArea,
                isHoveredExpandArea: ref.isHoveredExpandArea,
                isHoveredAddArea: ref.isHoveredAddArea,
                isSelected: isSelectedElement(board, ref.target),
                isShowCollapseAnimation:
                    (ref.isHovered || ref.isHoveredCollapseArea) && !isSelectedElement(board, ref.target) && !isSameTarget,
                isShowAddAnimation: (ref.isHovered || ref.isHoveredAddArea) && !isSelectedElement(board, ref.target) && !isSameTarget
            });
        }
    };

    board.pointerLeave = (event: PointerEvent) => {
        if (nodeMoreRef) {
            toggleHoveredNodeCallback({
                target: nodeMoreRef.target,
                isHovered: false,
                isHoveredAwarenessRectangle: false,
                isHoveredCollapseArea: false,
                isHoveredExpandArea: false,
                isHoveredAddArea: false
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
    let isHoveredAwarenessRectangle = false;
    let isHoveredCollapseArea = false;
    let isHoveredExpandArea = false;
    let isHoveredAddArea = false;
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
            const {
                hasCollapsedIcon,
                hasExpandedIcon,
                hasAddIcon,
                collapsedIconCenter,
                expandedIconCenter,
                addCenter,
                awarenessRectangle
            } = getNodeMoreKeyPosition(board, element);
            const isHitAwarenessRectangle =
                awarenessRectangle && RectangleClient.isHit(RectangleClient.getRectangleByPoints([point, point]), awarenessRectangle);
            const isHitCollapsedIcon =
                hasCollapsedIcon &&
                RectangleClient.isHit(
                    RectangleClient.getRectangleByPoints([point, point]),
                    RectangleClient.getRectangleByCenterPoint(collapsedIconCenter!, NODE_MORE_ICON_DIAMETER, NODE_MORE_ICON_DIAMETER)
                );
            const isHitExpandedIcon =
                hasExpandedIcon &&
                RectangleClient.isHit(
                    RectangleClient.getRectangleByPoints([point, point]),
                    RectangleClient.getRectangleByCenterPoint(expandedIconCenter!, NODE_MORE_ICON_DIAMETER, NODE_MORE_ICON_DIAMETER)
                );
            const isHitAddIcon =
                hasAddIcon &&
                RectangleClient.isHit(
                    RectangleClient.getRectangleByPoints([point, point]),
                    RectangleClient.getRectangleByCenterPoint(addCenter!, NODE_MORE_ICON_DIAMETER, NODE_MORE_ICON_DIAMETER)
                );
            if (isHitElement || isHitAwarenessRectangle) {
                isHovered = isHitElement;
                isHoveredAwarenessRectangle = !!isHitAwarenessRectangle;
                target = element;
                isHoveredCollapseArea = isHitCollapsedIcon;
                isHoveredExpandArea = !!isHitExpandedIcon;
                isHoveredAddArea = isHitAddIcon;
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
        isHoveredAwarenessRectangle,
        isHoveredCollapseArea,
        isHoveredExpandArea,
        isHoveredAddArea
    } as NodeMoreRef;
};
