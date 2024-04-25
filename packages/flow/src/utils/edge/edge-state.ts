import { PlaitBoard, PlaitElement, isSelectedElement } from '@plait/core';
import { getEdgesByNodeId } from './get-edges-by-node';
import { PlaitCommonElementRef } from '@plait/common';
import { EdgeGenerator } from '../../generators/edge-generator';
import { FlowEdge } from '../../interfaces/edge';
import { EdgeElementRef } from '../../core/edge-ref';
import { PlaitFlowBoard } from '../../interfaces';

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


export const renderEdgeOnDragging = (board: PlaitBoard, edge: FlowEdge) => {
    const edgeRef = PlaitElement.getElementRef<EdgeElementRef>(edge);
    edgeRef.buildPathPoints(board as PlaitFlowBoard, edge);
    const edgeGenerator = edgeRef.getGenerator<EdgeGenerator>(EdgeGenerator.key);
    edgeGenerator.processDrawing(edge, PlaitElement.getElementG(edge), { selected: true, hovered: false });
    edgeRef.updateLabelTextManage(edge);
}