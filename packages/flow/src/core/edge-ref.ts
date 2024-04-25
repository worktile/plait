import { PlaitCommonElementRef } from '@plait/common';
import { XYPosition } from '@plait/core';
import { FlowEdge } from '../interfaces/edge';
import { buildEdgePathPoints } from '../utils/edge/edge';
import { PlaitFlowBoard } from '../interfaces';
import { TextManage } from '@plait/text';

export enum EdgeState {
    'active' = 'active',
    'highlight' = 'highlight'
}

export class EdgeElementRef extends PlaitCommonElementRef {
    private pathPoints: XYPosition[] = [];

    private state: EdgeState | '' = '';

    private labelTextManage: TextManage | null = null;

    buildPathPoints(board: PlaitFlowBoard, element: FlowEdge) {
        this.pathPoints = buildEdgePathPoints(board, element);
    }

    getPoints() {
        return [...this.pathPoints];
    }

    setState(state: EdgeState | '') {
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
