import { ELEMENT_TO_PLUGIN_COMPONENT, RectangleClient } from '@plait/core';
import { PlaitBoard } from '@plait/core';
import { FlowEdgeComponent } from '../../flow-edge.component';
import { HIT_THERSHOLD } from '../../constants';
import { FlowEdge } from '../../interfaces/edge';

/**
 * isHitFlowEdge
 * @param element FlowEdge
 * @param board PlaitBoard
 * @returns boolean
 */
export function isHitFlowEdge(element: FlowEdge, board: PlaitBoard) {
    const edgeComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(element) as FlowEdgeComponent;
    const path = edgeComponent.nodeG?.querySelector('path');
    const pathLength = path?.getTotalLength();
    let minDistance = Number.MAX_VALUE;
    console.log(pathLength, 'pathLength')
    if (board.selection) {
        const clickReact = RectangleClient.toRectangleClient([board.selection.anchor, board.selection.focus]);
        for (var i = 0; i < pathLength!; i++) {
            var point = path?.getPointAtLength(i);
            var distance = Math.sqrt(Math.pow(point!.x - clickReact.x, 2) + Math.pow(point!.y - clickReact.y, 2));
            if (distance < minDistance) {
                minDistance = distance;
            }
        }
        return minDistance < HIT_THERSHOLD;
    }

    return false;
}
