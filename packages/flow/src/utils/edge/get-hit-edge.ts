import { PlaitBoard, PlaitElement, Point } from '@plait/core';
import { FlowElementType } from '../../interfaces/element';
import { getFlowElementsByType } from '../node/get-node';
import { isHitEdge } from './is-hit-edge';
import { FlowEdge } from '../../interfaces/edge';
import { FlowEdgeComponent } from '../../flow-edge.component';

export function getHitEdge(board: PlaitBoard, point: Point): FlowEdge | null {
    let flowEdge: FlowEdge | null = null;
    const flowEdges = getFlowElementsByType(board, FlowElementType.edge) as FlowEdge[];
    flowEdges.reverse().map((value, index) => {
        const component = PlaitElement.getComponent(value) as FlowEdgeComponent;
        if (!flowEdge && isHitEdge(board, value, point, component.pathPoints)) {
            flowEdge = value;
        }
    });
    return flowEdge;
}
