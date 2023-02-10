import { Options } from 'roughjs/bin/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { WORKFLOW_NODE_PORT_RADIOUS } from '../constants';
import { WorkflowCategoryType, WorkflowElement } from '../interfaces';
import { drawRoundRectangle, getNodePorts, getRectangleByNode } from '../utils/graph';

export function drawCircleNode(roughSVG: RoughSVG, node: WorkflowElement, radious: number, options?: Options | undefined) {
    const [centerPoint] = node.points;
    return roughSVG.circle(centerPoint[0], centerPoint[1], radious, options);
}

export function drawRectangleNode(roughSVG: RoughSVG, node: WorkflowElement, options: Options = {}) {
    const { x, y, width, height } = getRectangleByNode(node);
    const nodeG = drawRoundRectangle(roughSVG, x, y, x + width, y + height, {
        stroke: '#F5F5F5',
        strokeWidth: 2,
        fill: getColorByStatusCategory(node.type as WorkflowCategoryType),
        fillStyle: 'solid',
        ...options
    });

    return nodeG;
}

export function drawLinkPorts(roughSVG: RoughSVG, node: WorkflowElement) {
    const linkPorts = getNodePorts(node);
    return linkPorts.map(({ position, point }) => {
        return roughSVG.circle(point[0], point[1], WORKFLOW_NODE_PORT_RADIOUS, {
            stroke: '#6698FF',
            strokeWidth: 2,
            fill: 'transparent',
            fillStyle: 'solid'
        });
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
