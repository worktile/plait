import { FlowEdge } from '../../interfaces/edge';
import { PlaitBoard, XYPosition } from '@plait/core';
import { getEdgePoints } from './edge';

export function getEdgeTextXYPosition(board: PlaitBoard, edge: FlowEdge, width: number, height: number): XYPosition {
    const [pathPoints, labelX, labelY] = getEdgePoints(board, edge);
    const x = labelX - width / 2;
    const y = labelY - height / 2;
    return {
        x,
        y
    };
}
