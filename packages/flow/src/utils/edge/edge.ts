import { FlowHandle, FlowPosition } from '../../interfaces';
import { getHandlePosition } from '../get-handle-position';
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

// this is used for straight edges and simple smoothstep edges (LTR, RTL, BTT, TTB)
export function getEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY
}: {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
}): [number, number, number, number] {
    const xOffset = Math.abs(targetX - sourceX) / 2;
    const centerX = targetX < sourceX ? targetX + xOffset : targetX - xOffset;

    const yOffset = Math.abs(targetY - sourceY) / 2;
    const centerY = targetY < sourceY ? targetY + yOffset : targetY - yOffset;

    return [centerX, centerY, xOffset, yOffset];
}
