import { FlowHandle, FlowPosition, FlowRect } from '../interfaces';
import { getHandlePosition } from '../utils/get-handle-position';

interface EdgePositions {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
}

export const getEdgePositions = (
    sourceNodeRect: FlowRect,
    sourceHandle: FlowHandle,
    sourcePosition: FlowPosition,
    targetNodeRect: FlowRect,
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
