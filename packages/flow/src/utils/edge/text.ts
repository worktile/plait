import { FlowEdge } from '../../interfaces/edge';
import { PlaitBoard, XYPosition } from '@plait/core';
import { getEdgePoints } from './edge';

export function getEdgeTextXYPosition(board: PlaitBoard, edge: FlowEdge, width: number, height: number): XYPosition {
    const [pathPoints, centerX, centerY] = getEdgePoints(board, edge);
    const x = centerX - width / 2;
    const y = centerY - height / 2;
    return {
        x,
        y
    };
}
