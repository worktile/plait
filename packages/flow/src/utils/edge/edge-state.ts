import { PlaitBoard, PlaitElement } from '@plait/core';
import { getEdgesByNodeId } from './get-edges-by-node';
import { EdgeGenerator } from '../../generators/edge-generator';
import { FlowEdge } from '../../interfaces/edge';
import { EdgeElementRef } from '../../core/edge-ref';
import { PlaitFlowBoard } from '../../interfaces';
import { EdgeState } from '../../interfaces/flow';

export const updateRelatedEdgeState = (board: PlaitBoard, nodeId: string, state: EdgeState) => {
    const relationEdges = getEdgesByNodeId(board, nodeId);
    (relationEdges || []).forEach(edge => {
        updateEdgeState(board, edge, state);
    });
};

export const updateEdgeState = (board: PlaitBoard, edge: FlowEdge, state: EdgeState) => {
    const elementRef = PlaitElement.getElementRef<EdgeElementRef>(edge);
    elementRef.setState(state);
    renderEdge(board, edge, elementRef.getState());
};

export const renderEdge = (board: PlaitBoard, edge: FlowEdge, state?: EdgeState) => {
    const elementRef = PlaitElement.getElementRef<EdgeElementRef>(edge);
    const edgeGenerator = elementRef.getGenerator<EdgeGenerator>(EdgeGenerator.key);
    const currentEdgeState = elementRef.getState();
    if (state === EdgeState.hovering && (currentEdgeState === EdgeState.active || currentEdgeState === EdgeState.highlight)) {
        return;
    }
    edgeGenerator.processDrawing(edge, PlaitElement.getElementG(edge), { state: state || elementRef.getState() });
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
    const state = edgeRef.getState();
    edgeGenerator.processDrawing(edge, PlaitElement.getElementG(edge), { state });
    edgeRef.updateLabelTextManage(edge);
};
