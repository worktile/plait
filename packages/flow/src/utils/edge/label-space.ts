import { FlowEdge } from '../../interfaces/edge';
import { ELEMENT_TO_COMPONENT, PlaitBoard, RectangleClient } from '@plait/core';
import { FlowEdgeComponent } from '../../flow-edge.component';
import { EDGE_LABEL_FONTSIZE, EDGE_LABEL_ICON_PADDING, EDGE_LABEL_PADDING } from '../../constants/edge';
import { BaseText, Element } from 'slate';
import { TEXT_DEFAULT_HEIGHT, getTextSize } from '@plait/text';
import { getEdgeTextXYPosition } from './text';

// 使用 getSizeByText，渲染 dom 获取文本宽度，频繁调用会有性能问题
function getLabelTextRect(board: PlaitBoard, edge: FlowEdge): RectangleClient {
    const text = ((edge.data?.text as Element).children[0] as BaseText).text;
    let { width } = getTextSize(board, text, undefined, { fontSize: EDGE_LABEL_FONTSIZE });
    const height = edge.labelOptions?.height || TEXT_DEFAULT_HEIGHT;
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

function getLabelIconRect(element: FlowEdge): RectangleClient {
    const component = ELEMENT_TO_COMPONENT.get(element) as FlowEdgeComponent;
    const { x, y, height } = component.textRect!;
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
