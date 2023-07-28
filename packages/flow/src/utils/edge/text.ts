import { FlowEdge } from '../../interfaces/edge';
import { PlaitBoard, XYPosition } from '@plait/core';

export function getEdgeTextXYPosition(width: number, height: number, center: XYPosition): XYPosition {
    const x = center.x - width / 2;
    const y = center.y - height / 2;
    return {
        x,
        y
    };
}
