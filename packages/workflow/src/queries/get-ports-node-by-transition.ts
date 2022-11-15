import { getNodePorts } from './get-node-ports';
import { WORKFLOW_START_RADIOUS } from '../constants';
import { Point, PlaitBoard } from '@plait/core';
import { isWorkflowOrigin, WorkflowElement, WorkflowPortsNode, WorkflowTransitionLinkType } from '../interfaces';

export const getPortsNodeByTransition: (board: PlaitBoard, transition: WorkflowElement) => WorkflowPortsNode = (
    board: PlaitBoard,
    transition: WorkflowElement
) => {
    const { id: endId, port: endPort } = transition.to as WorkflowTransitionLinkType;
    const workflowNode = board.children.find(item => item.id === endId) as WorkflowElement;
    let ports = getNodePorts(workflowNode);
    let startPoint: Point | null = null;
    const endPoint = ports[endPort] as Point;
    if (transition.type === 'inital') {
        const [x, y] = board.children.find(item => {
            return isWorkflowOrigin(item);
        })?.points[0] as Point;
        startPoint = [x, y + WORKFLOW_START_RADIOUS / 2];
    }

    if (transition.type === 'directed') {
        const { id: startId, port: startPort } = transition.from![0];
        const node = board.children.find(item => item.id === startId) as WorkflowElement;
        ports = getNodePorts(node);
        startPoint = ports[startPort] as Point;
    }

    return {
        ...transition,
        startPoint,
        endPoint
    };
};
