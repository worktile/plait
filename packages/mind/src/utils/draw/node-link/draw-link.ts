import { PlaitBoard } from '@plait/core';
import { drawIndentedLink } from './indented-link';
import { drawLogicLink } from './logic-link';
import { MindElement } from '../../../interfaces/element';
import { MindNode } from '../../../interfaces/node';
import { StrokeStyle } from '@plait/common';

export function drawLink(
    board: PlaitBoard,
    parentNode: MindNode,
    node: MindNode,
    isHorizontal: boolean,
    needDrawUnderline?: boolean,
    defaultStrokeColor?: string,
    defaultStrokeWidth?: number,
    defaultStrokeStyle?: StrokeStyle
) {
    return MindElement.isIndentedLayout(parentNode.origin)
        ? drawIndentedLink(board, parentNode, node, needDrawUnderline, defaultStrokeColor, defaultStrokeWidth, defaultStrokeStyle)
        : drawLogicLink(board, parentNode, node, isHorizontal, defaultStrokeColor, defaultStrokeWidth, defaultStrokeStyle);
}
