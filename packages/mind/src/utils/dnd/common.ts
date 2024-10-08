import { getNonAbstractChildren, isStandardLayout } from '@plait/layouts';
import { MindElement, PlaitMind } from '../../interfaces/element';
import { Path, PlaitBoard, PlaitElement, setDragging } from '@plait/core';
import { getRootLayout } from '../layout';
import { DetectResult } from '../../interfaces/node';

export const addActiveOnDragOrigin = (activeElement: MindElement) => {
    PlaitElement.getElementG(activeElement).classList.add('dragging-node');

    !activeElement.isCollapsed &&
        activeElement.children.forEach(child => {
            addActiveOnDragOrigin(child);
        });
};

export const removeActiveOnDragOrigin = (activeElement: MindElement) => {
    PlaitElement.getElementG(activeElement).classList.remove('dragging-node');
    !activeElement.isCollapsed &&
        activeElement.children.forEach(child => {
            removeActiveOnDragOrigin(child);
        });
};

export const setMindDragging = (board: PlaitBoard, state: boolean) => {
    setDragging(board, state);
    if (state) {
        PlaitBoard.getBoardContainer(board).classList.add('mind-node-dragging');
    } else {
        PlaitBoard.getBoardContainer(board).classList.remove('mind-node-dragging');
    }
};

export const hasPreviousOrNextOfDropPath = (
    parent: MindElement,
    dropTarget: {
        target: MindElement;
        detectResult: DetectResult;
    },
    dropPath: Path
) => {
    let children = getNonAbstractChildren(parent);

    if (PlaitMind.isMind(parent) && isStandardLayout(getRootLayout(parent))) {
        const isDropRight = isDropStandardRight(parent, dropTarget);

        if (isDropRight) {
            children = children.slice(0, parent.rightNodeCount!);
        }
        if (!isDropRight) {
            children = children.slice(parent.rightNodeCount!, children.length);
            dropPath = [...dropPath, dropPath[dropPath.length - 1] - parent.rightNodeCount!];
        }
    }

    let hasPreviousNode = dropPath[dropPath.length - 1] !== 0;
    let hasNextNode = dropPath[dropPath.length - 1] !== (children?.length || 0);

    if (parent.isCollapsed) {
        hasNextNode = false;
        hasPreviousNode = false;
    }

    return {
        hasPreviousNode,
        hasNextNode
    };
};

export const isDropStandardRight = (
    parent: MindElement,
    dropTarget: {
        target: MindElement;
        detectResult: DetectResult;
    }
) => {
    const target = dropTarget.target;

    return (
        (PlaitMind.isMind(parent) &&
            isStandardLayout(getRootLayout(parent)) &&
            parent.children.indexOf(target) !== -1 &&
            parent.children.indexOf(target) < parent.rightNodeCount!) ||
        (PlaitMind.isMind(target) && isStandardLayout(getRootLayout(target)) && dropTarget.detectResult === 'right')
    );
};
