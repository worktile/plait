import { FlowEdge } from '../../interfaces/edge';
import { PlaitBoard, PlaitOptionsBoard, RectangleClient, XYPosition } from '@plait/core';
import { EDGE_LABEL_FONTSIZE, EDGE_LABEL_ICON_PADDING, EDGE_LABEL_PADDING } from '../../constants/edge';
import { BaseText, Element } from 'slate';
import { TEXT_DEFAULT_HEIGHT, getTextSize } from '@plait/text';
import { getEdgeTextXYPosition } from './text';
import { FlowPluginOptions, FlowPluginKey } from '../../interfaces/flow';

// 使用 getSizeByText，渲染 dom 获取文本宽度，频繁调用会有性能问题
function getLabelTextRect(board: PlaitBoard, edge: FlowEdge, pathPoints: XYPosition[]): RectangleClient {
    const text = ((edge.data?.text as Element).children[0] as BaseText).text;
    const labelTextWidth = getTextSize(board, text, undefined, { fontSize: EDGE_LABEL_FONTSIZE })?.width;
    const { edgeLabelOptions } = (board as PlaitOptionsBoard).getPluginOptions<FlowPluginOptions>(FlowPluginKey.flowOptions);

    const width = edgeLabelOptions.maxWidth
        ? labelTextWidth > edgeLabelOptions.maxWidth
            ? edgeLabelOptions.maxWidth
            : labelTextWidth
        : labelTextWidth;
    const height = edgeLabelOptions.height || TEXT_DEFAULT_HEIGHT;

    const { x, y } = getEdgeTextXYPosition(board, edge, width, height, pathPoints);
    return {
        x,
        y,
        width,
        height
    };
}

function getLabelIconFontSize() {
    return EDGE_LABEL_FONTSIZE;
}

function getLabelIconWidth() {
    return EDGE_LABEL_FONTSIZE + EDGE_LABEL_ICON_PADDING;
}

function getLabelIconRect(textRect: RectangleClient): RectangleClient {
    const { x, y, height } = textRect!;
    return {
        x: x - getLabelIconWidth() - EDGE_LABEL_ICON_PADDING,
        y,
        width: getLabelIconWidth(),
        height: height
    };
}

function getLabelRect(textRect: RectangleClient, element: FlowEdge): RectangleClient {
    let { x, y, width, height } = textRect;
    x = x - EDGE_LABEL_PADDING;
    width = width + EDGE_LABEL_PADDING * 2;

    if (FlowEdge.hasIcon(element)) {
        x = x - getLabelIconWidth();
        width = width + getLabelIconWidth();
    }

    return {
        x,
        y,
        width,
        height
    };
}

export const EdgeLabelSpace = {
    getLabelTextRect,
    getLabelIconFontSize,
    getLabelIconRect,
    getLabelRect
};
