import { PlaitBoard, PlaitPlugin, toPoint, transformPoint, PlaitElement, BOARD_TO_HOST } from '@plait/core';
import { FlowNode } from '../interfaces/node';
import { FlowNodeComponent } from '../flow-node.component';
import { getHitNodeHandle, HitNodeHandle } from '../utils/handle/node';
import { getCreateEdgeInfo, isEdgeDragging } from '../utils';

export const withHandleHover: PlaitPlugin = (board: PlaitBoard) => {
    const { globalMousemove, globalMouseup } = board;

    let sourceFlowNodeHandle: HitNodeHandle | null = null;
    let targetFlowNodeHandle: HitNodeHandle | null = null;
    let hoveredNode: FlowNode | null;
    let hoveredHandle: HitNodeHandle | null;

    board.globalMousemove = (event: MouseEvent) => {
        const isCreating = getCreateEdgeInfo(board);
        const isDragging = isEdgeDragging(board);
        if (isCreating || isDragging) {
            const host = BOARD_TO_HOST.get(board);
            host?.classList.add('flow-dragging');
            const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            targetFlowNodeHandle = null;
            targetFlowNodeHandle = getHitNodeHandle(board, point);
            if (targetFlowNodeHandle) {
                hoveredHandle = targetFlowNodeHandle;
                const flowNodeComponent = PlaitElement.getComponent(hoveredHandle.node) as FlowNodeComponent;
                flowNodeComponent.drawActiveHandle(hoveredHandle.handlePoint, hoveredHandle.position);
            }
            if (hoveredHandle && !targetFlowNodeHandle) {
                const flowNodeComponent = PlaitElement.getComponent(hoveredHandle.node) as FlowNodeComponent;
                flowNodeComponent.removeActiveHandle(hoveredHandle.position);
            }
        }

        globalMousemove(event);
    };

    board.globalMouseup = (event: MouseEvent) => {
        globalMouseup(event);
        sourceFlowNodeHandle = null;
        targetFlowNodeHandle = null;
        hoveredNode = null;
        if (hoveredHandle) {
            const flowNodeComponent = PlaitElement.getComponent(hoveredHandle.node) as FlowNodeComponent;
            flowNodeComponent.removeActiveHandle(hoveredHandle.position);
            const host = BOARD_TO_HOST.get(board);
            host?.classList.remove('flow-dragging');
        }
        hoveredHandle = null;
    };

    return board;
};
