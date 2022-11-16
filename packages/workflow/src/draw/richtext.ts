import { WORKFLOW_START_RADIOUS } from '../constants';
import { WorkflowElement } from '../interfaces';
import { getRectangleByNode } from '../utils/graph';

export function getRichtextRectangleByNode(node: WorkflowElement) {
    let { x, y, width, height } = getRectangleByNode(node);
    const textX = x + 40;
    const textY = y + 10;
    return { width, height, textX, textY };
}

export function getRichtextCircleByNode(node: WorkflowElement) {
    let [centerPoint] = node.points;
    const textX = centerPoint[0] - 14;
    const textY = centerPoint[1] - 10;
    const width = WORKFLOW_START_RADIOUS;
    const height = WORKFLOW_START_RADIOUS;
    return { textX, textY, width, height };
}
