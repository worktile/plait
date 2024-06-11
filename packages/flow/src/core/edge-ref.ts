import { PlaitCommonElementRef } from '@plait/common';
import { PlaitBoard, XYPosition } from '@plait/core';
import { EdgeStableState, FlowEdge } from '../interfaces/edge';
import { buildEdgePathPoints } from '../utils/edge/edge';

export class EdgeElementRef extends PlaitCommonElementRef {
    private pathPoints: XYPosition[] = [];

    private state: EdgeStableState = EdgeStableState[''];

    buildPathPoints(board: PlaitBoard & PlaitBoard, element: FlowEdge) {
        this.pathPoints = buildEdgePathPoints(board, element);
    }

    getPoints() {
        return [...this.pathPoints];
    }

    setState(state: EdgeStableState) {
        this.state = state;
    }

    getState() {
        return this.state;
    }
}
