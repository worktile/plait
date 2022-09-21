import { ViewContainerRef } from '@angular/core';
import { drawRichtext, updateForeignObject } from '@plait/richtext';
import { BASE } from '../constants';
import { MindmapNode } from '../interfaces/node';
import { getRectangleByNode } from '../utils/graph';

export function drawMindmapNodeRichtext(node: MindmapNode, viewContainerRef: ViewContainerRef) {
    const { textX, textY, width, height } = getRichtextRectangleByNode(node);
    const classList = [];
    if (node.origin.isRoot) {
        classList.push('root-node');
    } else if (node.parent?.origin?.isRoot) {
        classList.push('root-child-node');
    } else {
        classList.push('child-node');
    }
    return drawRichtext(textX, textY, width, height, node.origin.value, viewContainerRef, classList);
}

export function updateMindmapNodeRichtextLocation(node: MindmapNode, g: SVGGElement, isEditable: boolean) {
    const { textX, textY, width, height } = getRichtextRectangleByNode(node);
    // add BASE * 10， avoid changing lines
    const bufferSpace = isEditable ? BASE * 100 : 0;
    updateForeignObject(g, width + bufferSpace, height, textX, textY);
}

export function getRichtextRectangleByNode(node: MindmapNode) {
    let { x, y, width, height } = getRectangleByNode(node);

    const offsetX = node.origin.isRoot ? BASE * 3 : BASE * 2;
    const offsetY = node.origin.isRoot ? BASE * 2 : BASE * 1;

    const textX = x + offsetX;
    const textY = y + offsetY;
    return { width, height, textX, textY };
}
