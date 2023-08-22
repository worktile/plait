import { PlaitBoard, PlaitElement } from '@plait/core';
import { getEdgesByNodeId } from './get-edges-by-node';
import { FlowRenderMode } from '../../interfaces/flow';
import { FlowEdgeComponent } from '../../flow-edge.component';

export const setRelationEdgeSelected = (board: PlaitBoard, nodeId: string, selected: boolean = false) => {
    const relationEdges = getEdgesByNodeId(board, nodeId);
    (relationEdges || []).forEach(edge => {
        const component = PlaitElement.getComponent(edge) as FlowEdgeComponent;
        if (component) {
            component.relatedNodeSelected = selected;
            component.drawElement(edge, selected ? FlowRenderMode.hover : FlowRenderMode.default);
        }
    });
};
