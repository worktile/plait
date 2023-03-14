import { FlowHandle, FlowPosition } from '../interfaces';
import { getHandlePosition } from '../utils/get-handle-position';
import { RectangleClient } from '@plait/core';

interface EdgePositions {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
}

export const getEdgePositions = (
    sourceNodeRect: RectangleClient,
    sourceHandle: FlowHandle,
    sourcePosition: FlowPosition,
    targetNodeRect: RectangleClient,
    targetHandle: FlowHandle,
    targetPosition: FlowPosition
): EdgePositions => {
    const sourceHandlePos = getHandlePosition(sourcePosition, sourceNodeRect, sourceHandle);
    const targetHandlePos = getHandlePosition(targetPosition, targetNodeRect, targetHandle);
    return {
        sourceX: sourceHandlePos.x,
        sourceY: sourceHandlePos.y,
        targetX: targetHandlePos.x,
        targetY: targetHandlePos.y
    };
};
