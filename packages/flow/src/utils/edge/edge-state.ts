import { PlaitBoard, PlaitElement, isSelectedElement } from '@plait/core';
import { getEdgesByNodeId } from './get-edges-by-node';
import { PlaitCommonElementRef } from '@plait/common';
import { EdgeGenerator } from '../../generators/edge-generator';
import { FlowEdge } from '../../interfaces/edge';

export const setRelatedEdgeState = (board: PlaitBoard, nodeId: string, hovered: boolean = false) => {
    const relationEdges = getEdgesByNodeId(board, nodeId);
    (relationEdges || []).forEach(edge => {
        setEdgeState(board, edge, hovered);
    });
};

export const setEdgeState = (board: PlaitBoard, edge: FlowEdge, hovered: boolean = false) => {
    const elementRef = PlaitElement.getElementRef<PlaitCommonElementRef>(edge);
    const edgeGenerator = elementRef.getGenerator<EdgeGenerator>(EdgeGenerator.key);
    const selected = isSelectedElement(board, edge);
    edgeGenerator.processDrawing(edge, PlaitElement.getElementG(edge), { selected, hovered });
};
