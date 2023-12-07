import { FlowEdge } from '../../interfaces/edge';
import { PlaitBoard, XYPosition } from '@plait/core';
import { getEdgePoints } from './edge';
import { getOverlapEdges } from './get-overlap-edges';
import { getLabelPoints } from './get-label-points';

export function getEdgeTextXYPosition(board: PlaitBoard, edge: FlowEdge, width: number, height: number): XYPosition {
    const pathPoints = getEdgePoints(board, edge);
    const overlapEdges = getOverlapEdges(board, edge);
    const labelPoints = getLabelPoints(edge.shape, [...pathPoints].reverse(), overlapEdges?.length + 1);
    const index = overlapEdges.findIndex(value => value.id === edge.id);
    const x = labelPoints[index]?.x - width / 2;
    const y = labelPoints[index]?.y - height / 2;
    return {
        x,
        y
    };
}
