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
import { getEmojiSize } from '../plugins/emoji/emoji';
import { MindElement } from '../interfaces/element';

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
    return drawRichtext(textX, textY, width, height, node.origin.data.topic, viewContainerRef, classList);
}

export function updateMindmapNodeRichtextLocation(node: MindmapNode, g: SVGGElement, isEditable: boolean) {
    const { textX, textY, width, height } = getRichtextRectangleByNode(node);
    // add BASE * 10， avoid changing lines
    const bufferSpace = isEditable ? BASE * 100 : 0;
    updateForeignObject(g, width + bufferSpace, height, textX, textY);
}

export function getRichtextRectangleByNode(node: MindmapNode) {
    let { x, y, width, height } = getRectangleByNode(node);
    const nodeHorizontalGap = node.origin.isRoot ? ROOT_NODE_TEXT_HORIZONTAL_GAP : CHILD_NODE_TEXT_HORIZONTAL_GAP;
    const nodeVerticalGap = node.origin.isRoot ? ROOT_NODE_TEXT_VERTICAL_GAP : CHILD_NODE_TEXT_VERTICAL_GAP;
    const emojiHorizontalGap = node.origin.isRoot ? ROOT_NODE_TEXT_VERTICAL_GAP : CHILD_NODE_TEXT_VERTICAL_GAP;
    if (MindElement.hasEmojis(node.origin)) {
        const textX = x + nodeHorizontalGap + getEmojiSize(node.origin).width + emojiHorizontalGap;
        const textY = y + nodeVerticalGap;
        return { width, height, textX, textY };
    } else {
        const textX = x + nodeHorizontalGap;
        const textY = y + nodeVerticalGap;
        return { width, height, textX, textY };
    }
}
