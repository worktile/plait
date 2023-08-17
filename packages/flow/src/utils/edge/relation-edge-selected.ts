import { PlaitBoard, PlaitElement } from '@plait/core';
import { getEdgesByNodeId } from './get-edges-by-node';
import { FlowRenderMode } from '../../interfaces/flow';
import { FlowEdgeComponent } from '../../flow-edge.component';

export const setRelationEdgeSelected = (board: PlaitBoard, nodeId: string, relatedNodeSelected: boolean = false) => {
    const relationEdges = getEdgesByNodeId(board, nodeId);
    (relationEdges || []).forEach(edge => {
        const component = PlaitElement.getComponent(edge) as FlowEdgeComponent;
        component.relatedNodeSelected = relatedNodeSelected;
        component && component.drawElement(edge, relatedNodeSelected ? FlowRenderMode.hover : FlowRenderMode.default);
    });
};
