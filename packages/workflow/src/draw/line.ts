import { RoughSVG } from 'roughjs/bin/svg';
import { WORKFLOW_GLOBAL_LINK_LENGTH } from '../constants';
import { WorkflowElement, WorkflowPortsNode, WorkflowTransitionType } from '../interfaces';
import { WORKFLOW_ELEMENT_TO_COMPONENT } from '../plugins/weak-maps';
import { WorkflowQueries } from '../queries';
import { computedProbablyPoints } from '../utils/utils';
import { WorkflowBaseComponent } from '../workflow-base.component';
import { PlaitBoard } from '../../../plait/src/interfaces/board';
import AStar from '../utils/AStar';

const aStar = new AStar();

export const drawLineByTransitionType = (board: PlaitBoard, roughSVG: RoughSVG, node: WorkflowPortsNode, type: WorkflowTransitionType) => {
    let linkG;
    switch (type) {
        case 'inital':
            linkG = drawInitalLine(roughSVG, node);
            break;
        case 'global':
            linkG = drawGlobalLine(roughSVG, node);
            break;
        default:
            linkG = drawDirectedLine(board, roughSVG, node);
            break;
    }
    return linkG;
};

export const drawInitalLine = (roughSVG: RoughSVG, node: WorkflowPortsNode) => {
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

export const drawGlobalLine = (roughSVG: RoughSVG, node: WorkflowPortsNode) => {
    const { endPoint } = node;
    return roughSVG.line(endPoint[0], endPoint[1] + 5, endPoint[0], endPoint[1] + WORKFLOW_GLOBAL_LINK_LENGTH, {
        fillStyle: 'solid',
        stroke: '#999',
        strokeWidth: 2
    });
};

export const drawDirectedLine = (board: PlaitBoard, roughSVG: RoughSVG, node: WorkflowElement) => {
    const startNode = board.children.find(item => item.id === node.from![0].id) as WorkflowElement;
    const endNode = board.children.find(item => item.id === node.to!.id) as WorkflowElement;

    let { fakeStartPoint, fakeEndPoint, points } = computedProbablyPoints(node.startPoint!, node.endPoint!, startNode, endNode, false);

    const routes = aStar.start(fakeStartPoint!, fakeEndPoint!, points);
    return roughSVG.linearPath([node.startPoint!, ...routes, node.endPoint], {
        fillStyle: 'solid',
        stroke: '#999',
        strokeWidth: 2
    });
};
