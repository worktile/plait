import { PlaitBoard } from '@plait/core';
import { drawIndentedLink } from './indented-link';
import { drawLogicLink } from './logic-link';
import { MindElement } from '../../../interfaces/element';
import { MindNode } from '../../../interfaces/node';

export function drawLink(
    board: PlaitBoard,
    parentNode: MindNode,
    node: MindNode,
    isHorizontal: boolean,
    needDrawUnderline?: boolean,
    defaultStroke?: string,
    defaultStrokeWidth?: number
) {
    return MindElement.isIndentedLayout(parentNode.origin)
        ? drawIndentedLink(board, parentNode, node, defaultStroke, needDrawUnderline, defaultStrokeWidth)
        : drawLogicLink(board, parentNode, node, isHorizontal, defaultStroke, defaultStrokeWidth);
}
