import { PlaitBoard, PlaitElement, getSelectedElements } from '@plait/core';
import { getEdgesByNodeId } from './get-edges-by-node';
import { FlowRenderMode } from '../../interfaces/flow';
import { FlowEdgeComponent } from '../../flow-edge.component';

export const setRelationEdgeSelected = (board: PlaitBoard, nodeId: string, selected: boolean = false) => {
    const currentRelationEdges = getEdgesByNodeId(board, nodeId);
    const selectedElement = getSelectedElements(board);
    let selectedRelationEdgeIds: string[] = [];
    if (!selected && selectedElement) {
        (getEdgesByNodeId(board, selectedElement[0]?.id) || []).forEach(edge => {
            selectedRelationEdgeIds.push(edge.id);
        });
    }
    (currentRelationEdges || []).forEach(edge => {
        const component = PlaitElement.getComponent(edge) as FlowEdgeComponent;
        component.relatedNodeSelected = selected || selectedRelationEdgeIds.includes(edge.id);
        component && component.drawElement(edge, component.relatedNodeSelected ? FlowRenderMode.hover : FlowRenderMode.default);
    });
};
