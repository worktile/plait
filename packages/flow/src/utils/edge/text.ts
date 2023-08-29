import { FlowEdge } from '../../interfaces/edge';
import { PlaitBoard, XYPosition } from '@plait/core';
import { getEdgePoints } from './edge';
import { getLabelPoints } from './get-smooth-step-edge';
import { getSameLineEdges } from './get-same-line-edges';

export function getEdgeTextXYPosition(board: PlaitBoard, edge: FlowEdge, width: number, height: number): XYPosition {
    const pathPoints = getEdgePoints(board, edge);
    const { edges, count } = getSameLineEdges(board, edge);
    const labelPoints = getLabelPoints([...pathPoints].reverse(), count + 1);
    const index = edges.findIndex(value => value.id === edge.id);
    const x = labelPoints[index]?.x - width / 2;
    const y = labelPoints[index]?.y - height / 2;
    return {
        x,
        y
    };
}
