import { FlowEdge } from '../interfaces';
import { getFlowNodeById } from './get-node-by-id';
import { getClientByNode } from './get-client-by-node';
import { getEdgePositions, getPoints } from '../utils';
import { PlaitBoard } from '@plait/core';

/**
 * getEdgePoints
 * @param board PlaitBoard
 * @param edge FlowEdge
 * @returns
 */
export const getEdgePoints = (board: PlaitBoard, edge: FlowEdge) => {
    const sourceNode = getFlowNodeById(board, edge.source?.id!);
    const targetNode = getFlowNodeById(board, edge.target?.id!);

    const { x: sourceNodeX, y: sourceNodeY, width: sourceNodeWidth, height: sourceNodeHeight } = getClientByNode(sourceNode);
    const { x: targetNodeX, y: targetNodeY, width: targetNodeWidth, height: targetNodeHeight } = getClientByNode(targetNode);
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
