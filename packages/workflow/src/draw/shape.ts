import { Options } from 'roughjs/bin/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { WORKFLOW_NODE_PORT_RADIOUS, WORKFLOW_START_RADIOUS } from '../constants';
import { WorkflowCategoryType, WorkflowElement } from '../interfaces';
import { WorkflowQueries } from '../queries';
import { drawRoundRectangle, getRectangleByNode } from '../utils/graph';

export function drawCircleNode(roughSVG: RoughSVG, node: WorkflowElement, radious: number, options?: Options | undefined) {
    const [centerPoint] = node.points;
    return roughSVG.circle(centerPoint[0], centerPoint[1], radious, options);
}

export function drawRectangleNode(roughSVG: RoughSVG, node: WorkflowElement) {
    const { x, y, width, height } = getRectangleByNode(node);

    const nodeG = drawRoundRectangle(roughSVG, x, y, x + width, y + height, {
        stroke: '#F5F5F5',
        strokeWidth: 2,
        fill: getColorByStatusCategory(node.type as WorkflowCategoryType),
        fillStyle: 'solid'
    });

    return nodeG;
}

export function drawLinkPorts(roughSVG: RoughSVG, node: WorkflowElement) {
    const linkPorts = WorkflowQueries.getNodePorts(node);
    return linkPorts.map(port => {
        return roughSVG.circle(port[0], port[1], WORKFLOW_NODE_PORT_RADIOUS, { stroke: '#6698FF', strokeWidth: 2 });
    });
}

export const getColorByStatusCategory = (statusCategory: WorkflowCategoryType) => {
    let color = '';
    switch (statusCategory) {
        case 'todo':
            color = '#DFE1E5';
            break;
        case 'done':
            color = '#E3FCEF';
            break;
        case 'in_progess':
            color = '#DDEBFF';
            break;
    }
    return color;
};
