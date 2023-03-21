import { FlowEdge } from '../../interfaces/edge';
import { BOARD_TO_HOST, PlaitBoard, RectangleClient } from '@plait/core';
import { getSizeByText } from '@plait/richtext';
import { TOPIC_FONT_SIZE } from '@plait/mindmap';
import { BaseText, Element } from 'slate';
import { getEdgePoints } from './edge';

// 使用 getSizeByText，渲染 dom 获取文本宽度，频繁调用会有性能问题
export function getEdgeTextRect(board: PlaitBoard, edge: FlowEdge): RectangleClient {
    const [pathPoints, labelX, labelY, offsetX, offsetY] = getEdgePoints(board, edge);
    const host = BOARD_TO_HOST.get(board);
    const text = ((edge.data?.text as Element).children[0] as BaseText).text;
    const { width } = getSizeByText(text, host!.parentElement as HTMLElement, TOPIC_FONT_SIZE);
    const height = 24;
    const x = labelX - width / 2;
    const y = labelY - height / 2;
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
