import { FlowHandle, FlowPosition } from '../../interfaces/element';
import { getHandleXYPosition } from '../handle/get-handle-position';
import { PlaitBoard, RectangleClient, normalizePoint } from '@plait/core';
import { getPoints } from './get-smooth-step-edge';
import { getFlowNodeById } from '../get-node-by-id';
import { FlowEdge } from '../../interfaces/edge';

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
    const sourceHandlePos = getHandleXYPosition(sourcePosition, sourceNodeRect, sourceHandle);
    const targetHandlePos = getHandleXYPosition(targetPosition, targetNodeRect, targetHandle);
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

/**
 * getEdgePoints
 * @param board PlaitBoard
 * @param edge FlowEdge
 * @returns `{source: XYPosition; sourcePosition: FlowPosition; target: XYPosition; targetPosition: FlowPosition; center: Partial<XYPosition>;offset: number;}`
 */
export const getEdgePoints = (board: PlaitBoard, edge: FlowEdge) => {
    const sourceNode = getFlowNodeById(board, edge.source?.id!);
    const targetNode = getFlowNodeById(board, edge.target?.id!);

    const { x: sourceNodeX, y: sourceNodeY } = normalizePoint(sourceNode.points![0]);
    const { x: targetNodeX, y: targetNodeY } = normalizePoint(targetNode.points![0]);
    const { width: sourceNodeWidth, height: sourceNodeHeight } = sourceNode;
    const { width: targetNodeWidth, height: targetNodeHeight } = targetNode;

    const { position: sourcePosition } = edge.source!;
    const { position: targetPosition } = edge.target;

    const { sourceX, sourceY, targetX, targetY } = getEdgePositions(
        {
            x: sourceNodeX,
            y: sourceNodeY,
            width: sourceNodeWidth,
            height: sourceNodeHeight
        },
        edge.source!,
        sourcePosition,
        {
            x: targetNodeX,
            y: targetNodeY,
            width: targetNodeWidth,
            height: targetNodeHeight
        },
        edge.target,
        targetPosition
    );

    return getPoints({
        source: { x: sourceX, y: sourceY },
        sourcePosition,
        target: { x: targetX, y: targetY },
        targetPosition,
        center: { x: undefined, y: undefined },
        offset: 30
    });
};
