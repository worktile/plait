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
