import { ViewContainerRef } from '@angular/core';
import { drawRichtext, updateForeignObject } from '@plait/richtext';
import { MindNode } from '../interfaces/node';
import { PlaitMindBoard } from '../plugins/with-extend-mind';
import { getTopicRectangleByNode } from '../utils/position/topic';

export function drawMindNodeRichtext(board: PlaitMindBoard, node: MindNode, viewContainerRef: ViewContainerRef) {
    const { x, y, width, height } = getTopicRectangleByNode(board, node);
    const classList = [];
    if (node.origin.isRoot) {
        classList.push('root-node');
        classList.push('font-size-18');
    } else if (node.parent?.origin?.isRoot) {
        classList.push('root-child-node');
    } else {
        classList.push('child-node');
    }
    // COMPAT: last character can not show in safari browser
    return drawRichtext(x, y, width, height, node.origin.data.topic, viewContainerRef, classList);
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

