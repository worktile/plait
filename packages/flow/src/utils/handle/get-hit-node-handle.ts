import { PlaitBoard, Point, distanceBetweenPointAndPoint, normalizePoint } from '@plait/core';
import { getDefaultHandles } from './get-default-handles';
import { FlowNode } from '../../interfaces/node';
import { getHandleXYPosition } from './get-handle-position';
import { HANDLE_DIAMETER } from '../../constants/handle';
import { FlowEdgeHandle } from '../../interfaces/edge';
import { getFlowElementsByType } from '../node/get-node';
import { FlowElementType } from '../../public-api';

export function getHitNodeHandle(board: PlaitBoard, currentPoint: Point): (FlowEdgeHandle & { handlePoint: Point }) | null {
    let nodeHandle: (FlowEdgeHandle & { handlePoint: Point }) | null = null;
    const flowNodeElements = getFlowElementsByType(board, FlowElementType.node) as FlowNode[];
    flowNodeElements.map(item => {
        const handles = item.handles || getDefaultHandles();
        handles.filter(handle => {
            const { x, y } = normalizePoint(item.points![0]);
            let { x: handleX, y: handleY } = getHandleXYPosition(
                handle.position,
                {
                    x,
                    y,
                    width: item.width,
                    height: item.height
                },
                handle
            );
            const distance = distanceBetweenPointAndPoint(handleX, handleY, currentPoint[0], currentPoint[1]);
            if (distance < HANDLE_DIAMETER / 2) {
                nodeHandle = {
                    ...handle,
                    handlePoint: [handleX, handleY],
                    node: item
                };
            }
        });
    });
    return nodeHandle;
}
