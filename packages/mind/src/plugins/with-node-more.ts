import {
    depthFirstRecursion,
    getElementById,
    getIsRecursionFunc,
    isSelectedElement,
    isTouchDevice,
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
    isHit: boolean;
    isHitAwarenessRectangle: boolean;
    isHitCollapseArea: boolean;
    isHitExpandArea: boolean;
    isHitAddArea: boolean;
}

export const isSameNodeMoreRef = (ref1: NodeMoreRef | null, ref2: NodeMoreRef | null) => {
    if (!ref1 || !ref2) {
        return false;
    }
    const result =
        ref1.target === ref2.target &&
        ref1.isHit === ref2.isHit &&
        ref1.isHitAwarenessRectangle === ref2.isHitAwarenessRectangle &&
        ref1.isHitCollapseArea === ref2.isHitCollapseArea &&
        ref1.isHitExpandArea === ref2.isHitExpandArea &&
        ref1.isHitAddArea === ref2.isHitAddArea;
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
                            isHit: false,
                            isHitAwarenessRectangle: false,
                            isHitCollapseArea: false,
                            isHitExpandArea: false,
                            isHitAddArea: false
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
        if (nodeMoreRef && (nodeMoreRef.isHitCollapseArea || nodeMoreRef.isHitExpandArea)) {
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
        if (nodeMoreRef && nodeMoreRef.isHitAddArea && !PlaitBoard.isReadonly(board)) {
            if (nodeMoreRef) {
                const path = findNewChildNodePath(board, nodeMoreRef.target);
                insertMindElement(board as PlaitMindBoard, nodeMoreRef.target, path);
            }
            return;
        }
        if (isTouchDevice()) {
            const nodeMoreRef = getNodeMoreRef(board, event.x, event.y);
            if (nodeMoreRef && nodeMoreRef.isHitAddArea) {
                const path = findNewChildNodePath(board, nodeMoreRef.target);
                insertMindElement(board as PlaitMindBoard, nodeMoreRef.target, path);
                return;
            }
            if (nodeMoreRef && (nodeMoreRef.isHitExpandArea || nodeMoreRef.isHitCollapseArea)) {
                const isCollapsed = !nodeMoreRef.target.isCollapsed;
                const newElement: Partial<MindElement> = { isCollapsed };
                const path = PlaitBoard.findPath(board, nodeMoreRef.target);
                Transforms.setNode(board, newElement, path);
                return;
            }
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
                isHit: ref.isHit,
                isHitAwarenessRectangle: ref.isHitAwarenessRectangle,
                isHitCollapseArea: ref.isHitCollapseArea,
                isHitExpandArea: ref.isHitExpandArea,
                isHitAddArea: ref.isHitAddArea,
                isSelected: isSelectedElement(board, ref.target),
                isShowCollapseAnimation: (ref.isHit || ref.isHitCollapseArea) && !isSelectedElement(board, ref.target) && !isSameTarget,
                isShowAddAnimation: (ref.isHit || ref.isHitAddArea) && !isSelectedElement(board, ref.target) && !isSameTarget
            });
        }
    };

    board.pointerLeave = (event: PointerEvent) => {
        if (nodeMoreRef) {
            toggleHoveredNodeCallback({
                target: nodeMoreRef.target,
                isHit: false,
                isHitAwarenessRectangle: false,
                isHitCollapseArea: false,
                isHitExpandArea: false,
                isHitAddArea: false
            });
        }
        nodeMoreRef = null;
        pointerLeave(event);
    };

    return board;
};

const getNodeMoreRef = (board: PlaitBoard, x: number, y: number) => {
    let target: MindElement | null = null;
    let isHit = false;
    let isHitAwarenessRectangle = false;
    let isHitCollapseArea = false;
    let isHitExpandArea = false;
    let isHitAddArea = false;
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
            const isHitAwarenessRectangleInternal =
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
            if (isHitElement || isHitAwarenessRectangleInternal) {
                isHit = isHitElement;
                target = element;
                isHitCollapseArea = isHitCollapsedIcon;
                isHitExpandArea = !!isHitExpandedIcon;
                isHitAddArea = isHitAddIcon;
                isHitAwarenessRectangle = !!isHitAwarenessRectangleInternal;
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
        isHit,
        isHitAwarenessRectangle,
        isHitCollapseArea,
        isHitExpandArea,
        isHitAddArea
    } as NodeMoreRef;
};
