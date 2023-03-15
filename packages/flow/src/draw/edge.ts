import { PlaitBoard } from '@plait/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { FlowEdge } from '../interfaces';
import { Options } from 'roughjs/bin/core';
import { getBend, getPoints } from '../utils/edge/get-smooth-step-edge';
import { getFlowNodeById } from '../queries/get-node-by-id';
import { getEdgePositions } from '../utils';

export const drawEdge = (board: PlaitBoard, roughSVG: RoughSVG, edge: FlowEdge, options: Options = {}) => {
    const sourceNode = getFlowNodeById(board, edge.source?.id!);
    const targetNode = getFlowNodeById(board, edge.target?.id!);
    const [sourceEdgeX, sourceEdgeY] = sourceNode!.points![0];
    const [targetEdgeX, targetEdgeY] = targetNode!.points![0];
    const { position: sourcePosition } = edge.source!;
    const { position: targetPosition } = edge.target;

    const { sourceX, sourceY, targetX, targetY } = getEdgePositions(
        {
            x: sourceEdgeX,
            y: sourceEdgeY,
            width: sourceNode.width,
            height: sourceNode.height
        },
        edge.source!,
        sourcePosition,
        {
            x: targetEdgeX,
            y: targetEdgeY,
            width: sourceNode.width,
            height: sourceNode.height
        },
        edge.target,
        targetPosition
    );

    const [pathPoints, labelX, labelY, offsetX, offsetY] = getPoints({
        source: { x: sourceX, y: sourceY },
        sourcePosition,
        target: { x: targetX, y: targetY },
        targetPosition,
        center: { x: undefined, y: undefined },
        offset: 20
    });

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
        stroke: '#999',
        strokeWidth: 2,
        ...options
    });
};
