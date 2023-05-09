import { ViewContainerRef } from '@angular/core';
import { drawRichtext, updateForeignObject } from '@plait/richtext';
import { BASE } from '../constants/default';
import { MindNode } from '../interfaces/node';
import { getRectangleByNode } from '../utils/graph';
import { NodeSpace } from '../utils/node-space';

export function drawMindNodeRichtext(node: MindNode, viewContainerRef: ViewContainerRef) {
    const { x, y } = getRichtextRectangleByNode(node);
    const classList = [];
    if (node.origin.isRoot) {
        classList.push('root-node');
        classList.push('font-size-18');
    } else if (node.parent?.origin?.isRoot) {
        classList.push('root-child-node');
    } else {
        classList.push('child-node');
    }
    return drawRichtext(x, y, node.origin.width, node.origin.height, node.origin.data.topic, viewContainerRef, classList);
}

export function updateMindNodeTopicSize(node: MindNode, g: SVGGElement, isEditable: boolean) {
    const { x, y, width, height } = getRichtextRectangleByNode(node);
    if (isEditable) {
        // add 999， avoid changing lines when paste more text
        updateForeignObject(g, width + 999, height + 999, x, y);
    } else {
        updateForeignObject(g, node.origin.width, node.origin.height, x, y);
    }
}

export function getRichtextRectangleByNode(node: MindNode) {
    let { x, y, width, height } = getRectangleByNode(node);
    x = x + NodeSpace.getTextHorizontalSpace(node.origin);
    y = y + NodeSpace.getTextVerticalSpace(node.origin);
    return { width, height, x, y };
}
