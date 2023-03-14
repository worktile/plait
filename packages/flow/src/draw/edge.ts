import { PlaitBoard } from '@plait/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { FlowEdge } from '../interfaces';
import { Options } from 'roughjs/bin/core';
import { getBend, getPoints } from '../utils/get-smooth-step-edge';
import { getFlowNodeById } from '../queries/get-node-by-id';
import { getEdgePositions } from '../utils/get-edge-position';
import { getClientByNode } from '../queries/get-client-by-node';
import { getHandlePosition } from '../utils';
import { getHandlesByEdge } from '../queries/get-handles-by-edge';
import { HANDLE_DIAMETER } from '../constants';

/**
 * getEdgePoints
 * @param board PlaitBoard
 * @param edge FlowEdge
 * @returns
 */
export const getEdgePoints = (
    board: PlaitBoard,
    edge: FlowEdge,
    sourceOffset = {
        x: 0,
        y: 0
    },
    targetOffset = {
        x: 0,
        y: 0
    }
) => {
    const sourceNode = getFlowNodeById(board, edge.source?.id!);
    const targetNode = getFlowNodeById(board, edge.target?.id!);

    const { x: sourceNodeX, y: sourceNodeY, width: sourceNodeWidth, height: sourceNodeHeight } = getClientByNode(sourceNode);
    const { x: targetNodeX, y: targetNodeY, width: targetNodeWidth, height: targetNodeHeight } = getClientByNode(targetNode);
    const { position: sourcePosition } = edge.source!;
    const { position: targetPosition } = edge.target;

    const { sourceX, sourceY, targetX, targetY } = getEdgePositions(
        {
            x: sourceNodeX + sourceOffset.x,
            y: sourceNodeY + sourceOffset.y,
            width: sourceNodeWidth,
            height: sourceNodeHeight
        },
        edge.source!,
        sourcePosition,
        {
            x: targetNodeX + targetOffset.x,
            y: targetNodeY + targetOffset.y,
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

/**
 * drawEdge
 * @param board PlaitBoard
 * @param roughSVG RoughSVG
 * @param edge FlowEdge
 * @param active boolaen
 * @returns
 */
export const drawEdge = (
    board: PlaitBoard,
    roughSVG: RoughSVG,
    edge: FlowEdge,
    active = false,
    sourceOffset = {
        x: 0,
        y: 0
    },
    targetOffset = {
        x: 0,
        y: 0
    }
) => {
    const [pathPoints, labelX, labelY] = getEdgePoints(board, edge, sourceOffset, targetOffset);
    const options: Options = edge.options || {};
    const path = pathPoints.reduce<string>((res, p, i) => {
        let segment = '';
        if (i > 0 && i < pathPoints.length - 1) {
            segment = getBend(pathPoints[i - 1], p, pathPoints[i + 1], 5);
        } else {
            segment = `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`;
        }
        res += segment;
        return res;
    }, '');

    return roughSVG.path(path, {
        fillStyle: 'solid',
        strokeWidth: 2,
        ...options,
        stroke: active ? 'rgb(38, 132, 255)' : options.stroke || '#999'
    });
};

export const drawEdgeHandles = (board: PlaitBoard, roughSVG: RoughSVG, edges: FlowEdge) => {
    const handles = getHandlesByEdge(board, edges);
    return handles.map(handle => {
        const position = getHandlePosition(handle.position, handle.nodeRect, handle);
        return roughSVG.circle(position.x, position.y, HANDLE_DIAMETER, {
            stroke: '#6698FF',
            strokeWidth: 2,
            fill: '#fff',
            fillStyle: 'solid'
        });
    });
};
