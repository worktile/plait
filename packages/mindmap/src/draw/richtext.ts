import { ViewContainerRef } from '@angular/core';
import { drawRichtext, updateForeignObject } from '@plait/richtext';
import { BASE } from '../constants/default';
import {
    CHILD_NODE_TEXT_HORIZONTAL_GAP,
    CHILD_NODE_TEXT_VERTICAL_GAP,
    ROOT_NODE_TEXT_HORIZONTAL_GAP,
    ROOT_NODE_TEXT_VERTICAL_GAP
} from '../constants/node';
import { MindmapNode } from '../interfaces/node';
import { getRectangleByNode } from '../utils/graph';

export function drawMindmapNodeRichtext(node: MindmapNode, viewContainerRef: ViewContainerRef) {
    const { textX, textY, width, height } = getRichtextRectangleByNode(node);
    const classList = [];
    if (node.origin.isRoot) {
        classList.push('root-node');
        classList.push('font-size-18');
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

    const offsetX = node.origin.isRoot ? ROOT_NODE_TEXT_HORIZONTAL_GAP : CHILD_NODE_TEXT_HORIZONTAL_GAP;
    const offsetY = node.origin.isRoot ? ROOT_NODE_TEXT_VERTICAL_GAP : CHILD_NODE_TEXT_VERTICAL_GAP;

    const textX = x + offsetX;
    const textY = y + offsetY;
    return { width, height, textX, textY };
}
