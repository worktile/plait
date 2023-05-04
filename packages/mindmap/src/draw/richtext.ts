import { ViewContainerRef } from '@angular/core';
import { drawRichtext, updateForeignObject } from '@plait/richtext';
import { BASE } from '../constants/default';
import { MindmapNode } from '../interfaces/node';
import { getRectangleByNode } from '../utils/graph';
import { NodeSpace } from '../utils/node-space';

export function drawMindmapNodeRichtext(node: MindmapNode, viewContainerRef: ViewContainerRef) {
    const { x, y, width, height } = getRichtextRectangleByNode(node);
    const classList = [];
    if (node.origin.isRoot) {
        classList.push('root-node');
        classList.push('font-size-18');
    } else if (node.parent?.origin?.isRoot) {
        classList.push('root-child-node');
    } else {
        classList.push('child-node');
    }
    return drawRichtext(x, y, width, height, node.origin.data.topic, viewContainerRef, classList);
}

export function updateMindmapNodeRichtextLocation(node: MindmapNode, g: SVGGElement, isEditable: boolean) {
    const { x, y, width, height } = getRichtextRectangleByNode(node);
    // add BASE * 10， avoid changing lines
    const bufferSpace = isEditable ? BASE * 100 : 0;
    updateForeignObject(g, width + bufferSpace, height, x, y);
}

export function getRichtextRectangleByNode(node: MindmapNode) {
    let { x, y, width, height } = getRectangleByNode(node);
    x = x + NodeSpace.getTextHorizontalSpace(node.origin);
    y = y + NodeSpace.getTextVerticalSpace(node.origin);
    return { width, height, x, y };
}
