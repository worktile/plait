import { FlowEdge } from '../../interfaces/edge';
import { PlaitBoard, XYPosition } from '@plait/core';
import { getLabelPoints } from './get-smooth-step-edge';
import { getOverlapEdges } from './get-overlap-edges';

export function getEdgeTextXYPosition(
    board: PlaitBoard,
    edge: FlowEdge,
    width: number,
    height: number,
    pathPoints: XYPosition[]
): XYPosition {
    const overlapEdges = getOverlapEdges(board, edge);
    const labelPoints = getLabelPoints([...pathPoints].reverse(), overlapEdges?.length + 1);
    const index = overlapEdges.findIndex(value => value.id === edge.id);
    const x = labelPoints[index]?.x - width / 2;
    const y = labelPoints[index]?.y - height / 2;
    return {
        x,
        y
    };
}
