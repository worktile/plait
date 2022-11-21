import { WORKFLOW_START_RADIOUS } from '../constants';
import { WorkflowElement } from '../interfaces';
import { getRectangleByNode } from './graph';

export function getRectangleRichtext(node: WorkflowElement) {
    let { x, y, width, height } = getRectangleByNode(node);
    const textX = x;
    const textY = y;
    return { width, height, textX, textY };
}

export function getCircleRichtext(node: WorkflowElement) {
    let [centerPoint] = node.points;
    const textX = centerPoint[0] - WORKFLOW_START_RADIOUS / 2;
    const textY = centerPoint[1] - WORKFLOW_START_RADIOUS / 2;
    const width = WORKFLOW_START_RADIOUS;
    const height = WORKFLOW_START_RADIOUS;
    return { textX, textY, width, height };
}
