import { MindElement } from '../../interfaces/element';
import { MindNodeComponent } from '../../node.component';
import { findUpElement } from '../mind';
import { Path, PlaitBoard, Transforms, ELEMENT_TO_COMPONENT, PlaitElement } from '@plait/core';
import { PlaitMind } from '../../interfaces/element';
import { DetectResult } from '../../interfaces/node';
import { PlaitMindComponent } from '../../mind.component';
import { MindTransforms } from '../../transforms';

import { deleteElementHandleAbstract, insertElementHandleAbstract } from '../abstract/common';

export const IS_DRAGGING = new WeakMap<PlaitBoard, boolean>();

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
