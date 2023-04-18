import { PlaitBoard, Point, distanceBetweenPointAndPoint, normalizePoint } from '@plait/core';
import { getDefaultHandles } from './get-default-handles';
import { FlowNode } from '../../interfaces/node';
import { getHandleXYPosition } from './get-handle-position';
import { HANDLE_RADIUS } from '../../constants/handle';
import { FlowEdge, FlowEdgeHandle } from '../../interfaces/edge';
import { FLOW_EDGE_DRAGGING_INFO } from '../../plugins/with-edge-dnd';

export const getHitNodeHandle = (board: PlaitBoard, edge: FlowEdge, currentPoint: Point) => {
    const flowEdgeDragInfo = FLOW_EDGE_DRAGGING_INFO.get(edge);
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
            if (distance < HANDLE_RADIUS && flowEdgeDragInfo.handleType && edge) {
                edgeHandle = {
                    ...handle,
                    node: item
                };
            }
        });
    });
    return edgeHandle;
};
