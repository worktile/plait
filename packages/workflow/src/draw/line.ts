import { RoughSVG } from 'roughjs/bin/svg';
import { WORKFLOW_GLOBAL_LINK_LENGTH } from '../constants';
import { WorkflowElement, WorkflowPortsNode, WorkflowTransitionType } from '../interfaces';
import { computedProbablyPoints } from '../utils/points';
import { PlaitBoard } from '@plait/core';
import AStar from '../utils/AStar';
import { Options } from 'roughjs/bin/core';

const aStar = new AStar();

export const drawLineByTransitionType = (
    board: PlaitBoard,
    roughSVG: RoughSVG,
    node: WorkflowPortsNode,
    type: WorkflowTransitionType,
    options: Options = {}
) => {
    let linkG;
    switch (type) {
        case 'inital':
            linkG = drawInitalLine(roughSVG, node, options);
            break;
        case 'global':
            linkG = drawGlobalLine(roughSVG, node, options);
            break;
        default:
            linkG = drawDirectedLine(board, roughSVG, node, options);
            break;
    }
    return linkG;
};

export const drawInitalLine = (roughSVG: RoughSVG, node: WorkflowPortsNode, options: Options = {}) => {
    const { startPoint, endPoint } = node;
    if (startPoint && endPoint) {
        return roughSVG.line(startPoint[0], startPoint[1], endPoint[0], endPoint[1], {
            fillStyle: 'solid',
            stroke: '#999',
            strokeWidth: 2,
            ...options
        });
    }
    return null;
};

export const drawGlobalLine = (roughSVG: RoughSVG, node: WorkflowPortsNode, options: Options = {}) => {
    const { endPoint } = node;
    return roughSVG.line(endPoint[0], endPoint[1] + 5, endPoint[0], endPoint[1] + WORKFLOW_GLOBAL_LINK_LENGTH, {
        fillStyle: 'solid',
        stroke: '#999',
        strokeWidth: 2,
        ...options
    });
};

export const drawDirectedLine = (board: PlaitBoard, roughSVG: RoughSVG, node: WorkflowElement, options: Options = {}) => {
    const startNode = board.children.find(item => item.id === node.from!.id) as WorkflowElement;
    const endNode = board.children.find(item => item.id === node.to!.id) as WorkflowElement;

    let { fakeStartPoint, fakeEndPoint, points } = computedProbablyPoints(node.startPoint!, node.endPoint!, startNode, endNode, false);
    const routes = aStar.start(fakeStartPoint!, fakeEndPoint!, points);

    return roughSVG.linearPath([node.startPoint!, ...routes, node.endPoint], {
        fillStyle: 'solid',
        stroke: '#999',
        strokeWidth: 2,
        ...options
    });
};
