import { PlaitBoard, PlaitElement, depthFirstRecursion, getIsRecursionFunc, toPoint, transformPoint } from '@plait/core';
import { MindElement } from '../../interfaces/element';
import { isHitMindElement } from '../position/node';

export interface NodeHoveredExtendRef {
    element: MindElement;
}

export const mouseMoveHandle = (board: PlaitBoard, event: MouseEvent, nodeHoveredExtendRef: NodeHoveredExtendRef | null) => {
    let target: MindElement | null = null;
    const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
    depthFirstRecursion(
        (board as unknown) as MindElement,
        element => {
            if (target) {
                return;
            }
            if (!MindElement.isMindElement(board, element)) {
                return;
            }
            const isHitElement = isHitMindElement(board, point, element);
            if (isHitElement) {
                target = element;
            }
        },
        getIsRecursionFunc(board),
        true
    );

    if (nodeHoveredExtendRef && target && nodeHoveredExtendRef.element === target) {
        return nodeHoveredExtendRef;
    }

    if (nodeHoveredExtendRef) {
        removeHovered(nodeHoveredExtendRef.element);
    }

    if (target) {
        addHovered(target);
        if (nodeHoveredExtendRef) {
            nodeHoveredExtendRef.element = target;
        } else {
            nodeHoveredExtendRef = { element: target };
        }
    } else {
        nodeHoveredExtendRef = null;
    }
    return nodeHoveredExtendRef;
};

export const mouseLeaveHandle = (board: PlaitBoard, event: MouseEvent, nodeHoveredExtendRef: NodeHoveredExtendRef | null) => {
    if (nodeHoveredExtendRef) {
        removeHovered(nodeHoveredExtendRef.element);
    }
};

export const addHovered = (element: MindElement) => {
    const component = PlaitElement.getComponent(element);
    component.g.classList.add('hovered');
};

export const removeHovered = (element: MindElement) => {
    const component = PlaitElement.getComponent(element);
    if (component && component.g) {
        component.g.classList.remove('hovered');
    }
};
