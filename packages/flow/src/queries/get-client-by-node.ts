import { FlowElement } from '../interfaces';
import { ELEMENT_TO_PLUGIN_COMPONENT, RectangleClient } from '@plait/core';

export function getClientByNode(node: FlowElement): RectangleClient {
    const [x, y] = node.points![0];
    const width = node.width!;
    const height = node.height!;
    const nodeComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(node);
    const transform = nodeComponent && nodeComponent.g?.style?.transform;
    if (transform) {
        const [offsetX, offsetY] = transform
            .split('(')[1]
            .split(')')[0]
            .split(',')
            .map(parseFloat);
        return {
            x: x + offsetX,
            y: y + offsetY,
            width,
            height
        };
    }
    return {
        x,
        y,
        width,
        height
    };
}
