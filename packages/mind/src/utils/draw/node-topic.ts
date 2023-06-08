import { ViewContainerRef } from '@angular/core';
import { drawRichtext } from '@plait/richtext';
import { MindNode } from '../../interfaces/node';
import { getTopicRectangleByNode } from '../position/topic';
import { PlaitMindBoard } from '../../plugins/with-mind.board';
import { PlaitBoard, RectangleClient, updateForeignObject } from '@plait/core';
import { MindElement } from '../../interfaces';

export function drawTopicByNode(board: PlaitMindBoard, node: MindNode, viewContainerRef?: ViewContainerRef) {
    const rectangle = getTopicRectangleByNode(board, node);
    return drawTopicByElement(board, rectangle, node.origin, viewContainerRef);
}

export function drawTopicByElement(
    board: PlaitMindBoard,
    rectangle: RectangleClient,
    element: MindElement,
    viewContainerRef?: ViewContainerRef
) {
    const containerRef = viewContainerRef || PlaitBoard.getComponent(board).viewContainerRef;
    const classList = [];
    if (element.isRoot) {
        classList.push('root-node');
        classList.push('font-size-18');
    } else {
        classList.push('child-node');
    }
    // COMPAT: last character can not show in safari browser
    return drawRichtext(rectangle.x, rectangle.y, rectangle.width, rectangle.height, element.data.topic, containerRef, classList);
}

export function updateMindNodeTopicSize(board: PlaitMindBoard, node: MindNode, g: SVGGElement, isEditable: boolean) {
    const { x, y, width, height } = getTopicRectangleByNode(board, node);
    if (isEditable) {
        // add 999， avoid changing lines when paste more text
        updateForeignObject(g, width + 999, height + 999, x, y);
    } else {
        // COMPAT: last character can not show in safari browser
        updateForeignObject(g, width, height, x, y);
    }
}
