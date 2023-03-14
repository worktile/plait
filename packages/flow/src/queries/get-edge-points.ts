import { FlowEdge } from '../interfaces';
import { getFlowNodeById } from './get-node-by-id';
import { getEdgePositions, getPoints } from '../utils';
import { PlaitBoard, normalizePoint } from '@plait/core';

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
