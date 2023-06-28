import { FlowEdge } from '../../interfaces/edge';
import { PlaitBoard, RectangleClient, XYPosition } from '@plait/core';
import { TEXT_DEFAULT_HEIGHT, getTextSize } from '@plait/text';
import { BaseText, Element } from 'slate';
import { getEdgePoints } from './edge';
import { EDGE_LABEL_FONTSIZE } from '../../constants/edge';
import { getIconFontSize } from '../icon/icon';

// 使用 getSizeByText，渲染 dom 获取文本宽度，频繁调用会有性能问题
export function getEdgeTextRect(board: PlaitBoard, edge: FlowEdge): RectangleClient {
    const text = ((edge.data?.text as Element).children[0] as BaseText).text;
    const { width } = getTextSize(board, text, 0, EDGE_LABEL_FONTSIZE);
    const height = TEXT_DEFAULT_HEIGHT;
    const { x, y } = getEdgeTextXYPosition(board, edge, width, height);
    return {
        x,
        y,
        width,
        height
    };
}

export function getEdgeTextXYPosition(board: PlaitBoard, edge: FlowEdge, width: number, height: number): XYPosition {
    const [pathPoints, labelX, labelY] = getEdgePoints(board, edge);
    const x = labelX - width / 2;
    const y = labelY - height / 2;
    return {
        x,
        y
    };
}

export function getEdgeTextBackgroundRect(textRect: RectangleClient, element: FlowEdge): RectangleClient {
    const padding = 10;
    let { x, y, width, height } = textRect;
    x = x - padding;
    width = width + padding * 2;

    if (FlowEdge.hasIcon(element)) {
        const iconWidth = getIconFontSize();
        x = x - iconWidth;
        width = width + iconWidth;
    }

    return {
        x,
        y,
        width,
        height
    };
}
