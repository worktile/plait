import { PlaitBoard } from '@plait/core';
import { FlowEdge, FlowEdgeHandle } from '../../interfaces/edge';
import { getFakeFlowNodeById, getFlowNodeById } from '../node/get-node';
import { getEdgeDraggingInfo } from '../edge/dragging-edge';

export const getEdgeHandles = (board: PlaitBoard, edge: FlowEdge) => {
    const handles: FlowEdgeHandle[] = [];
    let sourceNode, targetNode;
    const dragEdgeInfo = FlowEdge.isFlowEdgeElement(edge) && getEdgeDraggingInfo(edge);
    if (edge.source) {
        if (dragEdgeInfo && dragEdgeInfo.handleType === 'source') {
            sourceNode = getFakeFlowNodeById(board, edge.source.id, dragEdgeInfo.offsetX, dragEdgeInfo.offsetY);
        } else {
            sourceNode = getFlowNodeById(board, edge.source.id);
        }
        handles.push({
            position: edge.source.position,
            node: sourceNode,
            type: 'source'
        });
    }
    if (edge.target) {
        if (dragEdgeInfo && dragEdgeInfo.handleType === 'target') {
            targetNode = getFakeFlowNodeById(board, edge.target.id, dragEdgeInfo.offsetX, dragEdgeInfo.offsetY);
        } else {
            targetNode = getFlowNodeById(board, edge.target.id);
        }
        handles.push({
            position: edge.target.position,
            node: targetNode,
            type: 'target'
        });
    }
    return handles;
};
