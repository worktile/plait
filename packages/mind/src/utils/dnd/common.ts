import { getNonAbstractChildren, isStandardLayout } from '@plait/layouts';
import { MindElement, PlaitMind } from '../../interfaces/element';
import { MindNodeComponent } from '../../node.component';
import { Path, PlaitBoard, PlaitElement } from '@plait/core';
import { getRootLayout } from '../layout';

export const IS_DRAGGING = new WeakMap<PlaitBoard, boolean>();

export const addActiveOnDragOrigin = (activeElement: MindElement) => {
    const activeComponent = PlaitElement.getComponent(activeElement) as MindNodeComponent;
    activeComponent.g.classList.add('dragging-node');

    !activeElement.isCollapsed &&
        activeElement.children.forEach(child => {
            addActiveOnDragOrigin(child);
        });
};

export const removeActiveOnDragOrigin = (activeElement: MindElement) => {
    const activeComponent = PlaitElement.getComponent(activeElement) as MindNodeComponent;
    activeComponent.g.classList.remove('dragging-node');
    !activeElement.isCollapsed &&
        activeElement.children.forEach(child => {
            removeActiveOnDragOrigin(child);
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
        const dropStandardLeftTop =
            target === parent.children[parent.rightNodeCount!] && dropPath[dropPath.length - 1] === parent.rightNodeCount;
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
