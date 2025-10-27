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
import { MindElement, PlaitMind } from '../interfaces';
import { findNewChildNodePath, insertMindElement, isHitMindElement } from '../utils';
import { PlaitCommonElementRef } from '@plait/common';
import { canHandleNodeMore, getCollapseAndAddCenterPoint, NodeMoreGenerator } from '../generators/node-more.generator';
import { NODE_MORE_ICON_DIAMETER } from '../constants/default';
import { PlaitMindBoard } from './with-mind.board';

export interface NodeMoreRef {
    target: MindElement;
    isHovered: boolean;
    isHoveredCollapseArea: boolean;
    isHoveredExpandArea: boolean;
    isHoveredAddArea: boolean;
}

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

                if (nodeMoreRef && newNodeMoreRef && nodeMoreRef.target === newNodeMoreRef.target) {
                    return;
                }

                if (nodeMoreRef) {
                    const element = getElementById<MindElement>(board, nodeMoreRef.target.id);
                    // maybe element has been changed
                    if (element && element === nodeMoreRef.target) {
                        toggleHoveredNodeCallback({
                            target: nodeMoreRef.target,
                            isHovered: false,
                            isHoveredCollapseArea: false,
                            isHoveredExpandArea: false,
                            isHoveredAddArea: false
                        });
                    }
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

    const toggleHoveredNodeCallback = (ref: NodeMoreRef) => {
        const elementRef = PlaitElement.getElementRef<PlaitCommonElementRef>(ref.target);
        const nodeMoreGenerator = elementRef?.getGenerator<NodeMoreGenerator>(NodeMoreGenerator.key);
        if (nodeMoreGenerator) {
            const g = PlaitElement.getElementG(ref.target);
            nodeMoreGenerator.processDrawing(ref.target, g, {
                isHovered: ref.isHovered,
                isHoveredCollapseArea: ref.isHoveredCollapseArea,
                isHoveredExpandArea: ref.isHoveredExpandArea,
                isSelected: isSelectedElement(board, ref.target),
                isHoveredAddArea: ref.isHoveredAddArea,
                isShowCollapseAnimation: (ref.isHovered || ref.isHoveredCollapseArea) && !isSelectedElement(board, ref.target),
                isShowAddAnimation: (ref.isHovered || ref.isHoveredAddArea) && !isSelectedElement(board, ref.target)
            });
        }
    };

    board.pointerLeave = (event: PointerEvent) => {
        if (nodeMoreRef) {
            toggleHoveredNodeCallback({
                target: nodeMoreRef.target,
                isHovered: false,
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
            const isMind = PlaitMind.isMind(element);
            const isHitElement = isHitMindElement(board, point, element);
            let isHitCollapseOrExpand = false;
            let isHitAdd = false;
            const { collapseCenter, addCenter } = getCollapseAndAddCenterPoint(board, element);
            const collapseOrExpandIconRectangle =
                !isMind && RectangleClient.getRectangleByCenterPoint(collapseCenter, NODE_MORE_ICON_DIAMETER, NODE_MORE_ICON_DIAMETER);
            isHitCollapseOrExpand =
                collapseOrExpandIconRectangle &&
                RectangleClient.isHit(RectangleClient.getRectangleByPoints([point, point]), collapseOrExpandIconRectangle);
            const addIconRectangle = RectangleClient.getRectangleByCenterPoint(addCenter, NODE_MORE_ICON_DIAMETER, NODE_MORE_ICON_DIAMETER);
            isHitAdd = RectangleClient.isHit(RectangleClient.getRectangleByPoints([point, point]), addIconRectangle);
            if (isHitElement || isHitCollapseOrExpand || isHitAdd) {
                isHovered = isHitElement;
                if (element.children.length > 0) {
                    if (element.isCollapsed) {
                        isHoveredExpandArea = isHitCollapseOrExpand;
                    } else {
                        isHoveredCollapseArea = isHitCollapseOrExpand;
                    }
                }
                isHoveredAddArea = isHitAdd;
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
        isHoveredExpandArea,
        isHoveredAddArea
    } as NodeMoreRef;
};
