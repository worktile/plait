import { getNonAbstractChildren, isStandardLayout } from '@plait/layouts';
import { MindElement, PlaitMind } from '../../interfaces/element';
import { MindNodeComponent } from '../../node.component';
import { Path, PlaitBoard, PlaitElement } from '@plait/core';
import { getRootLayout } from '../layout';

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

export const isDragging = (board: PlaitBoard) => {
    return !!IS_DRAGGING.get(board);
};

export const setIsDragging = (board: PlaitBoard, state: boolean) => {
    IS_DRAGGING.set(board, state);
};

export const hasPreviousOrNextOfDropPath = (parent: MindElement, target: MindElement, dropPath: Path) => {
    const children = getNonAbstractChildren(parent);
    let hasPreviousNode = dropPath[dropPath.length - 1] !== 0;
    let hasNextNode = dropPath[dropPath.length - 1] !== (children?.length || 0);
    if (PlaitMind.isMind(parent) && isStandardLayout(getRootLayout(parent))) {
        const dropStandardRightBottom =
            target === parent.children[parent.rightNodeCount! - 1] && dropPath[dropPath.length - 1] === parent.rightNodeCount;
        const dropStandardLeftTop = target === parent.children[parent.rightNodeCount!] && dropPath[dropPath.length - 1] === parent.rightNodeCount;
        if (dropStandardRightBottom) {
            hasPreviousNode = true;
            hasNextNode = false;
        }
        if (dropStandardLeftTop) {
            hasPreviousNode = false;
            hasNextNode = true;
        }
    }

    if (parent.isCollapsed) {
        hasNextNode = false;
        hasPreviousNode = false;
    }

    return {
        hasPreviousNode,
        hasNextNode
    };
};
