import { PlaitBoard, PlaitElement } from '@plait/core';
import { getEdgesByNodeId } from './get-edges-by-node';
import { EdgeGenerator } from '../../generators/edge-generator';
import { EdgeStableState, EdgeState, FlowEdge } from '../../interfaces/edge';
import { EdgeElementRef } from '../../core/edge-ref';
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
    const renderState = state || elementRef.getState();
    edgeGenerator.processDrawing(edge, getEdgeLayer(board, edge, renderState), { state: renderState });
    edgeLabelGenerator.processDrawing(edge, PlaitElement.getElementG(edge), { state: renderState });
    if (renderState !== EdgeStableState['']) {
        const upperHost = PlaitBoard.getElementUpperHost(board);
        const elementG = PlaitElement.getElementG(edge);
        upperHost.append(elementG);
    } else {
        const elementHost = PlaitBoard.getElementHost(board);
        const elementG = PlaitElement.getElementG(edge);
        elementHost.append(elementG);
    }
};

export const renderRelatedEdges = (board: PlaitBoard, nodeId: string, state?: EdgeState) => {
    const relationEdges = getEdgesByNodeId(board, nodeId);
    (relationEdges || []).forEach(edge => {
        renderEdge(board, edge, state);
    });
};

export const renderEdgeOnDragging = (board: PlaitBoard, edge: FlowEdge) => {
    const edgeRef = PlaitElement.getElementRef<EdgeElementRef>(edge);
    edgeRef.buildPathPoints(board, edge);
    const edgeGenerator = edgeRef.getGenerator<EdgeGenerator>(EdgeGenerator.key);
    const edgeLabelGenerator = edgeRef.getGenerator<EdgeLabelGenerator>(EdgeLabelGenerator.key);
    const state = edgeRef.getState();
    edgeGenerator.processDrawing(edge, getEdgeLayer(board, edge, state), { state });
    edgeLabelGenerator.processDrawing(edge, PlaitElement.getElementG(edge), { state });
};

export const getEdgeLayer = (board: PlaitBoard, edge: FlowEdge, state: EdgeState) => {
    if (state === EdgeStableState['']) {
        const lowerHost = PlaitBoard.getElementLowerHost(board);
        return lowerHost;
    } else {
        return PlaitElement.getElementG(edge);
    }
};
