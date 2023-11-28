import { Direction, RectangleClient, XYPosition } from '@plait/core';
import { FlowHandle } from '../../interfaces/element';

export function getHandleXYPosition(position: Direction, nodeRect: RectangleClient, handle: FlowHandle | null = null): XYPosition {
    const x = (handle?.offsetX || 0) + nodeRect.x;
    const y = (handle?.offsetY || 0) + nodeRect.y;
    const width = nodeRect.width;
    const height = nodeRect.height;

    switch (position) {
        case Direction.top:
            return {
                x: x + width / 2,
                y
            };
        case Direction.right:
            return {
                x: x + width,
                y: y + height / 2
            };
        case Direction.bottom:
            return {
                x: x + width / 2,
                y: y + height
            };
        case Direction.left:
            return {
                x,
                y: y + height / 2
            };
    }
}
