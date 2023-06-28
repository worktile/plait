import { FlowEdge } from '../../interfaces/edge';
import { ELEMENT_TO_COMPONENT, RectangleClient } from '@plait/core';
import { FlowEdgeComponent } from '../../flow-edge.component';
import { EDGE_LABEL_FONTSIZE, EDGE_LABEL_ICON_PADDING } from '../../constants/edge';

export function getIconFontSize() {
    return EDGE_LABEL_FONTSIZE;
}

export function getIconForeignRectangle(element: FlowEdge): RectangleClient {
    const component = ELEMENT_TO_COMPONENT.get(element) as FlowEdgeComponent;
    const { x, y, height } = component.textRect!;
    const fontSize = getIconFontSize();
    return {
        x: x - fontSize - EDGE_LABEL_ICON_PADDING * 2,
        y,
        width: fontSize + EDGE_LABEL_ICON_PADDING,
        height: height
    };
}
