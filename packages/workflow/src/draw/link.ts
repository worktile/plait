import { RoughSVG } from 'roughjs/bin/svg';
import { WORKFLOW_GLOBAL_LINK_LENGTH } from '../constants';
import { WorkflowElement, WorkflowPortsNode, WorkflowTransitionType } from '../interfaces';

export const drawLinkByTransitionType = (roughSVG: RoughSVG, node: WorkflowPortsNode, type: WorkflowTransitionType) => {
    let linkG;
    switch (type) {
        case 'inital':
            linkG = drawInitalLink(roughSVG, node);
            break;
        case 'global':
            linkG = drawGlobalLink(roughSVG, node);
            break;
        default:
            linkG = drawDirectedLink(roughSVG, node);
            break;
    }
    return linkG;
};

export const drawInitalLink = (roughSVG: RoughSVG, node: WorkflowPortsNode) => {
    const { startPoint, endPoint } = node;
    if (startPoint && endPoint) {
        return roughSVG.line(startPoint[0], startPoint[1], endPoint[0], endPoint[1], {
            fillStyle: 'solid',
            stroke: '#999',
            strokeWidth: 2
        });
    }
    return null;
};

export const drawGlobalLink = (roughSVG: RoughSVG, node: WorkflowPortsNode) => {
    const { endPoint } = node;
    return roughSVG.line(endPoint[0], endPoint[1] + 5, endPoint[0], endPoint[1] + WORKFLOW_GLOBAL_LINK_LENGTH, {
        fillStyle: 'solid',
        stroke: '#999',
        strokeWidth: 2
    });
};

export const drawDirectedLink = (roughSVG: RoughSVG, node: WorkflowElement) => {};
