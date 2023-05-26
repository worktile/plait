import { PlaitBoard, Point, distanceBetweenPointAndPoint, normalizePoint } from '@plait/core';
import { FlowEdge, FlowEdgeHandle, FlowEdgeHandleType } from '../../interfaces/edge';
import { HANDLE_DIAMETER } from '../../constants/handle';
import { getHandleXYPosition } from './get-handle-position';
import { getEdgeDraggingInfo } from '../edge/dragging-edge';
import { getFakeFlowNodeById, getFlowNodeById } from '../node/get-node';

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

export function isHitEdgeHandle(board: PlaitBoard, edge: FlowEdge, point: Point): boolean {
    let isHitHandle = false;
    const handles = getEdgeHandles(board, edge);
    handles.find(handle => {
        const { x, y } = normalizePoint(handle.node.points![0]);
        const position = getHandleXYPosition(
            handle.position,
            {
                x,
                y,
                width: handle.node.width,
                height: handle.node.height
            },
            handle
        );
        const distance = distanceBetweenPointAndPoint(position.x, position.y, point[0], point[1]);
        if (distance < HANDLE_DIAMETER / 2) {
            isHitHandle = true;
        }
    });
    return isHitHandle;
}

export function getHitHandleTypeByEdge(board: PlaitBoard, point: Point, edge: FlowEdge): FlowEdgeHandleType | null {
    let handleType = null;
    const handles = getEdgeHandles(board, edge);
    handles.find(handle => {
        const { x, y } = normalizePoint(handle.node.points![0]);
        const position = getHandleXYPosition(
            handle.position,
            {
                x,
                y,
                width: handle.node.width,
                height: handle.node.height
            },
            handle
        );
        const distance = distanceBetweenPointAndPoint(position.x, position.y, point[0], point[1]);
        if (distance < HANDLE_DIAMETER / 2) {
            handleType = handle.type;
        }
    });
    return handleType;
}
