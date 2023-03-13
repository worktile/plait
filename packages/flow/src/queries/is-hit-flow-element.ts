import { ELEMENT_TO_PLUGIN_COMPONENT, Point, RectangleClient } from '@plait/core';
import { PlaitBoard } from '@plait/core';
import { FlowEdge, FlowElement, isFlowNodeElement } from '../interfaces';
import { getClientByNode } from './get-client-by-node';
import { FlowEdgeComponent } from '../flow-edge.component';

export function isHitFlowNode(element: FlowElement, point: Point) {
    if (isFlowNodeElement(element)) {
        const { x, y, width, height } = getClientByNode(element);
        return point[0] >= x && point[0] <= x + width && point[1] >= y && point[1] <= y + height;
    }
    return false;
}

export function isHitFlowEdge(element: FlowEdge, board: PlaitBoard) {
    const nodeComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(element) as FlowEdgeComponent;
    const path = nodeComponent.nodeG?.querySelector('path');
    const pathLength = path?.getTotalLength();
    let threshold = 5;
    let minDistance = Number.MAX_VALUE;
    if (board.selection) {
        const clickReact = RectangleClient.toRectangleClient([board.selection.anchor, board.selection.focus]);
        for (var i = 0; i < pathLength!; i++) {
            var point = path?.getPointAtLength(i);
            var distance = Math.sqrt(Math.pow(point!.x - clickReact.x, 2) + Math.pow(point!.y - clickReact.y, 2));
            if (distance < minDistance) {
                minDistance = distance;
            }
        }
        return minDistance < threshold;
    }
    return false;
}
