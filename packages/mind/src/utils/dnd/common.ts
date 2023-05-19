import { MindElement } from '../../interfaces/element';
import { MindNodeComponent } from '../../node.component';
import { findUpElement, isChildElement } from '../mind';
import { Path, PlaitBoard, Transforms, ELEMENT_TO_COMPONENT, PlaitElement, createG, Point, transformPoint, toPoint } from '@plait/core';
import {
    isHorizontalLogicLayout,
    isIndentedLayout,
    isLeftLayout,
    isRightLayout,
    isTopLayout,
    MindLayoutType,
    isBottomLayout,
    isVerticalLogicLayout,
    getNonAbstractChildren,
    isStandardLayout
} from '@plait/layouts';
import { PlaitMind } from '../../interfaces/element';
import { DetectResult, MindNode } from '../../interfaces/node';
import { PlaitMindComponent } from '../../mind.component';
import { MindTransforms } from '../../transforms';
import { getRichtextRectangleByNode } from '../../draw/richtext';
import { drawRectangleNode } from '../../draw/shape';
import { updateForeignObject } from '@plait/richtext';
import { BASE } from '../../constants';
import { PlaitMindBoard } from '../../public-api';
import { MindQueries } from '../../queries';
import { isMixedLayout } from '../layout';
import { deleteElementHandleAbstract, insertElementHandleAbstract } from '../abstract/common';
import { directionDetector, directionCorrector } from './direction';
import { drawPlaceholderDropNodeG } from './draw-placeholder';

export const IS_DRAGGING = new WeakMap<PlaitBoard, boolean>();

export const isValidTarget = (origin: MindElement, target: MindElement) => {
    return origin !== target && !isChildElement(origin, target);
};

export const addActiveOnDragOrigin = (activeElement: MindElement, isOrigin = true) => {
    const activeComponent = PlaitElement.getComponent(activeElement) as MindNodeComponent;
    if (isOrigin) {
        activeComponent.g.classList.add('dragging-origin');
    } else {
        activeComponent.g.classList.add('dragging-child');
    }
    !activeElement.isCollapsed &&
        activeElement.children.forEach(child => {
            addActiveOnDragOrigin(child, false);
        });
};

export const removeActiveOnDragOrigin = (activeElement: MindElement, isOrigin = true) => {
    const activeComponent = PlaitElement.getComponent(activeElement) as MindNodeComponent;
    if (isOrigin) {
        activeComponent.g.classList.remove('dragging-origin');
    } else {
        activeComponent.g.classList.remove('dragging-child');
    }
    !activeElement.isCollapsed &&
        activeElement.children.forEach(child => {
            removeActiveOnDragOrigin(child, false);
        });
};

export const updatePathByLayoutAndDropTarget = (
    targetPath: Path,
    layout: MindLayoutType,
    dropTarget: { target: MindElement; detectResult: DetectResult }
) => {
    // 上下布局：左右是兄弟节点，上下是子节点
    if (isVerticalLogicLayout(layout)) {
        if (isTopLayout(layout) && dropTarget.detectResult === 'top') {
            targetPath.push(dropTarget.target.children.length);
        }
        if (isBottomLayout(layout) && dropTarget.detectResult === 'bottom') {
            targetPath.push(dropTarget.target.children.length);
        }
        // 如果是左，位置不变，右则插入到下一个兄弟节点
        if (dropTarget.detectResult === 'right') {
            targetPath = Path.next(targetPath);
        }
    }
    // 水平布局/标准布局：上下是兄弟节点，左右是子节点
    if (isHorizontalLogicLayout(layout)) {
        if (dropTarget.detectResult === 'right') {
            targetPath.push(dropTarget.target.children.length);
        }
        if (dropTarget.detectResult === 'left') {
            targetPath.push(dropTarget.target.children.length);
        }
        // 如果是上，位置不变，下插入到下一个兄弟节点
        if (dropTarget.detectResult === 'bottom') {
            targetPath = Path.next(targetPath);
        }
    }
    // 缩进布局：上下是兄弟节点，左右是子节点，但上（左上/右上），探测到上是子节点，下则位置不变，反之同理。
    if (isIndentedLayout(layout)) {
        if (isTopLayout(layout) && dropTarget.detectResult === 'top') {
            targetPath = Path.next(targetPath);
        }
        if (isBottomLayout(layout) && dropTarget.detectResult === 'bottom') {
            targetPath = Path.next(targetPath);
        }
        if (isLeftLayout(layout) && dropTarget.detectResult === 'left') {
            targetPath.push(dropTarget.target.children.length);
        }
        if (isRightLayout(layout) && dropTarget.detectResult === 'right') {
            targetPath.push(dropTarget.target.children.length);
        }
    }
    return targetPath;
};

export const updateRightNodeCount = (
    board: PlaitBoard,
    activeComponent: MindNodeComponent,
    targetComponent: MindNodeComponent,
    detectResult: DetectResult
) => {
    let rightNodeCount;
    const mindElement = findUpElement(targetComponent.node.origin).root;
    const mindComponent = ELEMENT_TO_COMPONENT.get(mindElement as PlaitMind) as PlaitMindComponent;
    const activeIndex = mindComponent?.root.children.indexOf(activeComponent.node) as number;
    const targetIndex = mindComponent?.root.children.indexOf(targetComponent.node) as number;
    const activeParent = MindElement.getParent(activeComponent.element);
    const targetParent = MindElement.findParent(targetComponent.element);
    const isActiveOnRight = activeIndex !== -1 && activeIndex <= (activeParent.rightNodeCount as number) - 1;
    const isTargetOnRight = targetParent && targetIndex !== -1 && targetIndex <= (targetParent.rightNodeCount as number) - 1;
    const isBothOnRight = isActiveOnRight && isTargetOnRight;
    const rootChildCount = mindComponent.root.children?.length as number;
    const rootRightNodeCount = mindComponent?.root.origin.rightNodeCount as number;

    if (!isBothOnRight) {
        if (isActiveOnRight) {
            rightNodeCount = rootChildCount < rootRightNodeCount ? rootChildCount - 1 : rootRightNodeCount - 1;
            Transforms.setNode(board, { rightNodeCount }, PlaitBoard.findPath(board, activeParent));
        }

        if (isTargetOnRight && detectResult !== 'right') {
            rightNodeCount = rootChildCount < rootRightNodeCount ? rootRightNodeCount : rootRightNodeCount + 1;
            const parent = MindElement.getParent(targetComponent.element);
            Transforms.setNode(board, { rightNodeCount }, PlaitBoard.findPath(board, parent));
        }

        //二级子节点拖动到根节点左侧
        if (targetComponent.node.origin.isRoot && detectResult === 'left' && activeIndex === -1) {
            rightNodeCount = rootChildCount;
            Transforms.setNode(board, { rightNodeCount }, PlaitBoard.findPath(board, targetComponent.element));
        }
    }
};

export const isDragging = (board: PlaitBoard) => {
    return !!IS_DRAGGING.get(board);
};

export const setIsDragging = (board: PlaitBoard, state: boolean) => {
    IS_DRAGGING.set(board, state);
};

export const updateAbstractInDnd = (board: PlaitBoard, deletableElements: MindElement[], originPath: Path) => {
    const refs = insertElementHandleAbstract(board, originPath, false);
    deleteElementHandleAbstract(board, deletableElements, refs);
    MindTransforms.setAbstractsByRefs(board, refs);
};

export const drawFakeDragNode = (board: PlaitBoard, activeComponent: MindNodeComponent, offsetX: number, offsetY: number) => {
    const fakeDragNodeG = createG();
    fakeDragNodeG.classList.add('dragging', 'fake-node', 'plait-board-attached');

    const fakeDraggingNode: MindNode = {
        ...activeComponent.node,
        children: [],
        x: activeComponent.node.x + offsetX,
        y: activeComponent.node.y + offsetY
    };
    const textRectangle = getRichtextRectangleByNode(board as PlaitMindBoard, activeComponent.node);
    const fakeNodeG = drawRectangleNode(board, fakeDraggingNode);

    const richtextG = activeComponent.richtextG?.cloneNode(true) as SVGGElement;
    updateForeignObject(
        richtextG,
        textRectangle.width + BASE * 10,
        textRectangle.height,
        textRectangle.x + offsetX,
        textRectangle.y + offsetY
    );

    fakeDragNodeG?.append(fakeNodeG);
    fakeDragNodeG?.append(richtextG);
    return fakeDragNodeG;
};

export const getDropTarget = (
    board: PlaitBoard,
    detectPoint: Point,
    dropTarget: { target: MindElement; detectResult: DetectResult } | null,
    activeElement: MindElement
) => {
    let detectResult: DetectResult[] | null = null;
    board.children.forEach((value: PlaitElement) => {
        if (detectResult) {
            return;
        }
        if (PlaitMind.isMind(value)) {
            const mindComponent = ELEMENT_TO_COMPONENT.get(value) as PlaitMindComponent;
            const root = mindComponent?.root;

            (root as any).eachNode((node: MindNode) => {
                if (detectResult) {
                    return;
                }
                const directions = directionDetector(node, detectPoint);

                if (directions) {
                    detectResult = directionCorrector(board, node, directions);
                }
                dropTarget = null;
                if (detectResult && isValidTarget(activeElement, node.origin)) {
                    dropTarget = { target: node.origin, detectResult: detectResult[0] };
                }
            });
        }
    });

    return dropTarget;
};

/* 根据布局调整 target 以及 direction */
export const readjustmentDropTarget = (
    board: PlaitBoard,
    dropTarget: {
        target: MindElement;
        detectResult: DetectResult;
    }
): { target: MindElement; detectResult: DetectResult } => {
    const { target, detectResult } = dropTarget;
    const newDropTarget = { target, detectResult };
    const targetComponent = PlaitElement.getComponent(target) as MindNodeComponent;
    if (targetComponent.node.children.length > 0 && dropTarget.detectResult) {
        const layout = MindQueries.getCorrectLayoutByElement(board, targetComponent.node.origin);
        const parentLayout = MindQueries.getCorrectLayoutByElement(
            board,
            targetComponent.node.origin.isRoot ? targetComponent.node.origin : targetComponent.node.parent.origin
        );
        const children = getNonAbstractChildren(targetComponent.node);
        if (['right', 'left'].includes(dropTarget.detectResult)) {
            if (!isMixedLayout(parentLayout, layout)) {
                if (targetComponent.node.origin.isRoot) {
                    const layout = MindQueries.getCorrectLayoutByElement(board, targetComponent.node.origin);
                    // 标准布局，根节点
                    if (isStandardLayout(layout)) {
                        const rightNodeCount = targetComponent.node.origin.rightNodeCount as number;
                        if (detectResult === 'left') {
                            // 作为左的第一个节点
                            if (targetComponent.node.children.length === rightNodeCount) {
                                return newDropTarget;
                            }
                        } else {
                            // 作为右的第一个节点或最后一个节点
                            if (rightNodeCount === 0) {
                                newDropTarget.target = target;
                            } else {
                                newDropTarget.target = targetComponent.node.children[rightNodeCount - 1].origin;
                                newDropTarget.detectResult = 'bottom';
                            }
                            return newDropTarget;
                        }
                    }
                }

                // 缩进布局探测到第一个子节点
                if (isIndentedLayout(parentLayout)) {
                    newDropTarget.target = targetComponent.node.children[0].origin;
                    newDropTarget.detectResult = isTopLayout(parentLayout) ? 'bottom' : 'top';
                    return newDropTarget;
                }
                // 上下布局的根节点只可以探测到上或者下，子节点的左右探测不处理，跳过。
                if (isVerticalLogicLayout(parentLayout)) {
                    return newDropTarget;
                }
                // 剩下是水平布局的默认情况：插入最后一个子节点的下方
                const lastChildNodeIndex = children.length - 1;
                newDropTarget.target = targetComponent.node.children[lastChildNodeIndex].origin;
                newDropTarget.detectResult = 'bottom';
            } else {
                // 处理左右布局下的混合布局
                if ([MindLayoutType.left, MindLayoutType.right].includes(parentLayout)) {
                    const layout = MindQueries.getCorrectLayoutByElement(board, targetComponent.node.origin);
                    if (isIndentedLayout(layout)) {
                        newDropTarget.target = targetComponent.node.children[0].origin;
                        newDropTarget.detectResult = isTopLayout(layout) ? 'bottom' : 'top';
                        return newDropTarget;
                    }
                }
            }
        }
        if (['top', 'bottom'].includes(dropTarget.detectResult)) {
            // 缩进布局移动至第一个节点
            if (targetComponent.node.origin.isRoot && isIndentedLayout(layout)) {
                newDropTarget.target = targetComponent.node.children[0].origin;
                newDropTarget.detectResult = isTopLayout(layout) ? 'bottom' : 'top';
                return newDropTarget;
            }
            // 上下布局，插到右边
            const parentLayout = MindQueries.getCorrectLayoutByElement(
                board,
                targetComponent.node.origin.isRoot ? targetComponent.node.origin : targetComponent.node.parent.origin
            );
            if (isVerticalLogicLayout(parentLayout)) {
                const lastChildNodeIndex = children.length - 1;
                newDropTarget.target = targetComponent.node.children[lastChildNodeIndex].origin;
                newDropTarget.detectResult = 'right';
                return newDropTarget;
            }
        }
        return newDropTarget;
    }
    return dropTarget;
};
