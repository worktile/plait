import { PlaitBoard, PlaitElement, depthFirstRecursion, getIsRecursionFunc, toHostPoint, toViewBoxPoint } from '@plait/core';
import { MindElement } from '../../interfaces/element';
import { isHitMindElement } from '../position/node';

export interface NodeExtendHoveredRef {
    element: MindElement;
}

export const pointerMoveHandle = (board: PlaitBoard, event: PointerEvent, nodeExtendHoveredRef: NodeExtendHoveredRef | null) => {
    let target: MindElement | null = null;
    const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
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

    if (nodeExtendHoveredRef && target && nodeExtendHoveredRef.element === target) {
        return nodeExtendHoveredRef;
    }

    if (nodeExtendHoveredRef) {
        removeHovered(nodeExtendHoveredRef.element);
    }

    if (target) {
        addHovered(target);
        if (nodeExtendHoveredRef) {
            nodeExtendHoveredRef.element = target;
        } else {
            nodeExtendHoveredRef = { element: target };
        }
    } else {
        nodeExtendHoveredRef = null;
    }
    return nodeExtendHoveredRef;
};

export const pointerLeaveHandle = (board: PlaitBoard, event: PointerEvent, nodeExtendHoveredRef: NodeExtendHoveredRef | null) => {
    if (nodeExtendHoveredRef) {
        removeHovered(nodeExtendHoveredRef.element);
    }
};

export const addHovered = (element: MindElement) => {
    const component = PlaitElement.getComponent(element);
    component.getElementG().classList.add('hovered');
};

export const removeHovered = (element: MindElement) => {
    const component = PlaitElement.getComponent(element);
    if (component && component.getElementG()) {
        component.getElementG().classList.remove('hovered');
    }
};
