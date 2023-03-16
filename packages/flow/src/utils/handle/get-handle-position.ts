import { RectangleClient, XYPosition } from '@plait/core';
import { FlowHandle, FlowPosition } from '../../interfaces/element';

export function getHandlePosition(position: FlowPosition, nodeRect: RectangleClient, handle: FlowHandle | null = null): XYPosition {
    const x = (handle?.offsetX || 0) + nodeRect.x;
    const y = (handle?.offsetY || 0) + nodeRect.y;
    const width = nodeRect.width;
    const height = nodeRect.height;

    switch (position) {
        case FlowPosition.top:
            return {
                x: x + width / 2,
                y
            };
        case FlowPosition.right:
            return {
                x: x + width,
                y: y + height / 2
            };
        case FlowPosition.bottom:
            return {
                x: x + width / 2,
                y: y + height
            };
        case FlowPosition.left:
            return {
                x,
                y: y + height / 2
            };
    }
}
