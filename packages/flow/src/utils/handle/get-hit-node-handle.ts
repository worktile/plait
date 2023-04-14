import { Point, distanceBetweenPointAndPoint, normalizePoint } from '@plait/core';
import { FlowNode } from '../../interfaces/node';
import { getDefaultHandles } from './get-default-handles';
import { getHandleXYPosition } from './get-handle-position';
import { HANDLE_DIAMETER } from '../../constants/handle';
import { FlowHandle } from '../../interfaces/element';

export function getHitFlowNodeHandle(node: FlowNode, point: Point) {
    const handles = node.handles || getDefaultHandles();
    let hitHandle: (FlowHandle & { handlePoint: Point }) | null = null;
    handles.map(handle => {
        if (!hitHandle) {
            const { x, y } = normalizePoint(node.points![0]);
            let { x: handleX, y: handleY } = getHandleXYPosition(
                handle.position,
                {
                    x,
                    y,
                    width: node.width,
                    height: node.height
                },
                handle
            );
            const distance = distanceBetweenPointAndPoint(handleX, handleY, point[0], point[1]);
            if (distance < HANDLE_DIAMETER / 2) {
                hitHandle = {
                    ...handle,
                    handlePoint: [handleX, handleY]
                };
            }
        }
    });
    return hitHandle;
}
