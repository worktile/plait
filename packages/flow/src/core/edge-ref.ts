import { PlaitCommonElementRef } from '@plait/common';
import { XYPosition } from '@plait/core';
import { EdgeStableState, FlowEdge } from '../interfaces/edge';
import { buildEdgePathPoints } from '../utils/edge/edge';
import { PlaitFlowBoard } from '../interfaces';
import { TextManage } from '@plait/text';

export class EdgeElementRef extends PlaitCommonElementRef {
    private pathPoints: XYPosition[] = [];

    private state: EdgeStableState = EdgeStableState[''];

    private labelTextManage: TextManage | null = null;

    buildPathPoints(board: PlaitFlowBoard, element: FlowEdge) {
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

    initializeLabelTextManage(labelTextManage: TextManage) {
        this.labelTextManage = labelTextManage;
    }

    updateLabelTextManage(element: FlowEdge) {
        const text = element.data?.text;
        if (text && this.labelTextManage) {
            this.labelTextManage.updateText(text);
            this.labelTextManage.updateRectangle();
        }
    }
}
