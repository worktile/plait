import { ELEMENT_TO_PLUGIN_COMPONENT, Point } from '@plait/core';
import { BaseCursorStatus, PlaitBoard } from '@plait/core';
import { FlowNode, isFlowEdgeElement, isFlowNodeElement } from '../interfaces';
import { getClientByNode } from '../queries/get-client-by-node';
import { FlowEdgeComponent } from '../flow-edge.component';

export function isHitFlowNode(event: MouseEvent, board: PlaitBoard, point: Point, node: FlowNode) {
    if (board.cursor === BaseCursorStatus.move) return false;
    if (isFlowEdgeElement(node)) {
        const edgeComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(node) as FlowEdgeComponent;
        const { x, y, width, height } = edgeComponent.g.getBoundingClientRect();
        console.log(event.x, x);
        return event.x >= x && event.x <= x + width && event.y >= y && event.y <= y + height;
    }
    if (isFlowNodeElement(node)) {
        const { x, y, width, height } = getClientByNode(node);
        return point[0] >= x && point[0] <= x + width && point[1] >= y && point[1] <= y + height;
    }
    return false;
}
