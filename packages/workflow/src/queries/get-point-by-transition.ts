import { WORKFLOW_START_RADIOUS } from '../constants';
import { Point, PlaitBoard } from '@plait/core';
import { isWorkflowOrigin, WorkflowElement, WorkflowPortsNode, WorkflowTransitionLinkType } from '../interfaces';
import { getNodePorts } from '../utils/graph';
import { Position } from '../utils/path';

export const getPointByTransition: (board: PlaitBoard, transition: WorkflowElement) => WorkflowPortsNode = (
    board: PlaitBoard,
    transition: WorkflowElement
) => {
    const { id: endId, port: endPort } = transition.to as WorkflowTransitionLinkType;
    const workflowNode = board.children.find(item => item.id === endId) as WorkflowElement;
    let ports = getNodePorts(workflowNode);
    let startPoint: { point: Point; position: Position } | null = null;
    const endPoint = ports[endPort];
    if (transition.type === 'inital') {
        const [x, y] = board.children.find(item => {
            return isWorkflowOrigin(item);
        })?.points[0] as Point;
        startPoint = {
            point: [x, y + WORKFLOW_START_RADIOUS / 2],
            position: Position.Bottom
        };
    }

    if (transition.type === 'directed') {
        const { id: startId, port: startPort } = transition.from!;
        const node = board.children.find(item => item.id === startId) as WorkflowElement;
        ports = getNodePorts(node);
        startPoint = ports[startPort];
    }
    return {
        ...transition,
        startPoint,
        endPoint
    };
};
