import { PlaitCommonElementRef } from '@plait/common';
import { XYPosition } from '@plait/core';
import { FlowEdge } from '../interfaces/edge';
import { buildEdgePathPoints } from '../utils/edge/edge';
import { PlaitFlowBoard } from '../interfaces';

export class EdgeElementRef extends PlaitCommonElementRef {
    private pathPoints: XYPosition[] = [];

    buildPathPoints(board: PlaitFlowBoard, element: FlowEdge) {
        this.pathPoints = buildEdgePathPoints(board, element);
    }

    getPoints() {
        return [...this.pathPoints];
    }
}
