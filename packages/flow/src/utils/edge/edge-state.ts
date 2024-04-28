import { PlaitBoard, PlaitElement } from '@plait/core';
import { getEdgesByNodeId } from './get-edges-by-node';
import { EdgeGenerator } from '../../generators/edge-generator';
import { EdgeStableState, EdgeState, FlowEdge } from '../../interfaces/edge';
import { EdgeElementRef } from '../../core/edge-ref';
import { PlaitFlowBoard } from '../../interfaces';
import { EdgeLabelGenerator } from '../../generators/edge-label-generator';

export const updateRelatedEdgeHighlight = (board: PlaitBoard, nodeId: string, highlight: boolean) => {
    const relationEdges = getEdgesByNodeId(board, nodeId);
    (relationEdges || []).forEach(edge => {
        const elementRef = PlaitElement.getElementRef<EdgeElementRef>(edge);
        const currentState = elementRef.getState();
        const state = highlight
            ? EdgeStableState.highlight
            : currentState === EdgeStableState.active
            ? EdgeStableState.active
            : EdgeStableState[''];
        elementRef.setState(state);
        renderEdge(board, edge, state);
    });
};

export const renderEdge = (board: PlaitBoard, edge: FlowEdge, state?: EdgeState) => {
    const elementRef = PlaitElement.getElementRef<EdgeElementRef>(edge);
    const edgeGenerator = elementRef.getGenerator<EdgeGenerator>(EdgeGenerator.key);
    const edgeLabelGenerator = elementRef.getGenerator<EdgeLabelGenerator>(EdgeLabelGenerator.key);
    const currentEdgeState = elementRef.getState();
    if (state === 'hovering' && (currentEdgeState === EdgeStableState.active || currentEdgeState === EdgeStableState.highlight)) {
        return;
    }
    edgeGenerator.processDrawing(edge, PlaitElement.getElementG(edge), { state: state || elementRef.getState() });
    edgeLabelGenerator.processDrawing(edge, PlaitElement.getElementG(edge), { state: state || elementRef.getState() });
};

export const renderRelatedEdges = (board: PlaitBoard, nodeId: string, state?: EdgeState) => {
    const relationEdges = getEdgesByNodeId(board, nodeId);
    (relationEdges || []).forEach(edge => {
        renderEdge(board, edge, state);
    });
};

export const renderEdgeOnDragging = (board: PlaitBoard, edge: FlowEdge) => {
    const edgeRef = PlaitElement.getElementRef<EdgeElementRef>(edge);
    edgeRef.buildPathPoints(board as PlaitFlowBoard, edge);
    const edgeGenerator = edgeRef.getGenerator<EdgeGenerator>(EdgeGenerator.key);
    const edgeLabelGenerator = edgeRef.getGenerator<EdgeLabelGenerator>(EdgeLabelGenerator.key);
    const state = edgeRef.getState();
    edgeGenerator.processDrawing(edge, PlaitElement.getElementG(edge), { state });
    edgeLabelGenerator.processDrawing(edge, PlaitElement.getElementG(edge), { state });
};
