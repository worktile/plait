import { FlowElement } from '../interfaces';
import { RectangleClient } from '@plait/core';

export function getRectangleByNode(node: FlowElement): RectangleClient {
    const [x, y] = node.points![0];
    const width = node.width!;
    const height = node.height!;
    return {
        x,
        y,
        width,
        height
    };
}
