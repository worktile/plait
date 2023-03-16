import { FlowEdge } from '../../interfaces/edge';
import { BOARD_TO_HOST, PlaitBoard, RectangleClient } from '@plait/core';
import { getWidthByText } from '@plait/richtext';
import { BaseText, Element } from 'slate';
import { getEdgePoints } from './edge';

export function getEdgeTextRect(board: PlaitBoard, edge: FlowEdge): RectangleClient {
    const [pathPoints, labelX, labelY, offsetX, offsetY] = getEdgePoints(board, edge);
    const host = BOARD_TO_HOST.get(board);
    const text = ((edge.data?.text as Element).children[0] as BaseText).text;
    let width = getWidthByText(text, host!.parentElement as HTMLElement);
    const height = 24;
    const x = labelX - width / 2;
    const y = labelY - height / 2;
    // 5 ：获取到的 width 不能将文字完全展示
    width = width + 5;
    return {
        x,
        y,
        width,
        height
    };
}

export function getEdgeTextBackgroundRect(textRect: RectangleClient): RectangleClient {
    const padding = 10;
    return {
        x: textRect.x - padding,
        y: textRect.y,
        width: textRect.width + padding * 2,
        height: textRect.height
    };
}
