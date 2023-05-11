import { FlowEdge } from '../../interfaces/edge';
import { BOARD_TO_HOST, PlaitBoard, RectangleClient, XYPosition } from '@plait/core';
import { TEXT_DEFAULT_HEIGHT, getSizeByText } from '@plait/richtext';
import { BaseText, Element } from 'slate';
import { getEdgePoints } from './edge';

// 使用 getSizeByText，渲染 dom 获取文本宽度，频繁调用会有性能问题
export function getEdgeTextRect(board: PlaitBoard, edge: FlowEdge): RectangleClient | null {
    const host = BOARD_TO_HOST.get(board);
    const text = ((edge.data?.text as Element).children[0] as BaseText).text;
    const { width } = getSizeByText(text, host!.parentElement as HTMLElement);
    const height = TEXT_DEFAULT_HEIGHT;
    const textXYPosition = getEdgeTextXYPosition(board, edge, width, height);
    if (textXYPosition) {
        const { x, y } = textXYPosition;
        return {
            x,
            y,
            width,
            height
        };
    }
    return null;
}

export function getEdgeTextXYPosition(board: PlaitBoard, edge: FlowEdge, width: number, height: number): XYPosition | null {
    const edgePoints = getEdgePoints(board, edge);
    if (edgePoints) {
        const [pathPoints, labelX, labelY] = edgePoints;
        const x = labelX - width / 2;
        const y = labelY - height / 2;
        return {
            x,
            y
        };
    }
    return null;
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
