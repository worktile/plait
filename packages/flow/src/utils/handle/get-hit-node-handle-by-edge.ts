import { PlaitBoard, Point, distanceBetweenPointAndPoint, normalizePoint } from '@plait/core';
import { getDefaultHandles } from './get-default-handles';
import { FlowNode } from '../../interfaces/node';
import { getHandleXYPosition } from './get-handle-position';
import { HANDLE_DIAMETER } from '../../constants/handle';
import { FlowEdge, FlowEdgeHandle } from '../../interfaces/edge';
import { getEdgeDraggingInfo } from '../edge/dragging-edge';

export const getHitNodeHandleByEdge = (board: PlaitBoard, edge: FlowEdge, currentPoint: Point) => {
    const flowEdgeDragInfo = getEdgeDraggingInfo(edge);
    if (!flowEdgeDragInfo) {
        return null;
    }
    let edgeHandle: FlowEdgeHandle | null = null;
    const flowNodeElements = board.children.filter(item => FlowNode.isFlowNodeElement(item)) as FlowNode[];
    flowNodeElements.map(item => {
        const handles = item.handles || getDefaultHandles();
        handles.filter(handle => {
            const { x, y } = normalizePoint(item.points![0]);
            let { x: handleX, y: handleY } = getHandleXYPosition(
                handle.position,
                {
                    x,
                    y,
                    width: item.width,
                    height: item.height
                },
                handle
            );
            const distance = distanceBetweenPointAndPoint(handleX, handleY, currentPoint[0], currentPoint[1]);
            if (distance < HANDLE_DIAMETER / 2 && flowEdgeDragInfo.handleType && edge) {
                edgeHandle = {
                    ...handle,
                    node: item
                };
            }
        });
    });
    return edgeHandle;
};
