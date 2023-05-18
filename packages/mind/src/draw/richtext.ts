import { ViewContainerRef } from '@angular/core';
import { drawRichtext, updateForeignObject } from '@plait/richtext';
import { BASE } from '../constants/default';
import { MindNode } from '../interfaces/node';
import { getRectangleByNode } from '../utils/graph';
import { NodeSpace } from '../utils/node-space';
import { PlaitMindBoard } from '../plugins/with-extend-mind';

export function drawMindNodeRichtext(board: PlaitMindBoard, node: MindNode, viewContainerRef: ViewContainerRef) {
    const { x, y, width, height } = getRichtextRectangleByNode(board, node);
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
    const { x, y, width, height } = getRichtextRectangleByNode(board, node);
    if (isEditable) {
        // add 999， avoid changing lines when paste more text
        updateForeignObject(g, width + 999, height + 999, x, y);
    } else {
        // COMPAT: last character can not show in safari browser
        updateForeignObject(g, width, height, x, y);
    }
}

export function getRichtextRectangleByNode(board: PlaitMindBoard, node: MindNode) {
    let { x, y } = getRectangleByNode(node);
    x = x + NodeSpace.getTextLeftSpace(board, node.origin);
    y = y + NodeSpace.getTextTopSpace(node.origin);
    const width = Math.ceil(node.origin.width);
    const height = Math.ceil(node.origin.height);
    return { height, width, x, y };
}
