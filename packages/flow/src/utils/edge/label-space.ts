import { FlowEdge } from '../../interfaces/edge';
import { PlaitBoard, PlaitOptionsBoard, RectangleClient } from '@plait/core';
import { EDGE_LABEL_FONTSIZE, EDGE_LABEL_ICON_PADDING, EDGE_LABEL_PADDING } from '../../constants/edge';
import { getEdgeTextXYPosition } from './text';
import { FlowPluginOptions, FlowPluginKey } from '../../interfaces/flow';
import { DEFAULT_FONT_FAMILY, measureElement } from '@plait/common';
import { TEXT_DEFAULT_HEIGHT } from '@plait/text-plugins';

function getLabelTextRectangle(board: PlaitBoard, edge: FlowEdge): RectangleClient {
    const { width: labelTextWidth } = measureElement(edge.data!.text!, {
        fontSize: EDGE_LABEL_FONTSIZE,
        fontFamily: DEFAULT_FONT_FAMILY
    });

    const { edgeLabelOptions } = (board as PlaitOptionsBoard).getPluginOptions<FlowPluginOptions>(FlowPluginKey.flowOptions);
    const width = edgeLabelOptions.maxWidth
        ? labelTextWidth > edgeLabelOptions.maxWidth
            ? edgeLabelOptions.maxWidth
            : labelTextWidth
        : labelTextWidth;
    const height = edgeLabelOptions.height || TEXT_DEFAULT_HEIGHT;

    const { x, y } = getEdgeTextXYPosition(board, edge, width, height);
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

function getLabelIconRectangle(textRect: RectangleClient): RectangleClient {
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

    if (FlowEdge.hasLabelIcon(element)) {
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
    getLabelTextRectangle,
    getLabelIconFontSize,
    getLabelIconRectangle,
    getLabelRect
};
