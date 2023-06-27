import { PlaitBoard, PlaitPlugin, PlaitElement, drawCircle, transformPoint, toPoint } from '@plait/core';
import { FlowNodeComponent } from '../flow-node.component';
import { HitNodeHandle, getHitNodeHandle } from '../utils/handle/node';
import { addHoverHandleInfo, deleteHoverHandleInfo } from '../utils/handle/hover-handle';
import { DEFAULT_HANDLE_STYLES, HANDLE_BUFFER, HANDLE_DIAMETER } from '../constants/handle';
import { isEdgeDragging } from '../utils/edge/dragging-edge';
import { getCreateEdgeInfo } from '../utils/edge/create-edge';

export const withHandleHover: PlaitPlugin = (board: PlaitBoard) => {
    const { globalMousemove, globalMouseup } = board;

    let previousHoverdHandle: HitNodeHandle | null = null;
    let hoveredHandle: HitNodeHandle | null;
    let activeHandleElement: SVGGElement;

    board.globalMousemove = (event: MouseEvent) => {
        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        hoveredHandle = getHitNodeHandle(board, point);
        addHoverHandleInfo(board, hoveredHandle);
        if (isEdgeDragging(board) || getCreateEdgeInfo(board)) {
            if (hoveredHandle && previousHoverdHandle?.handlePoint.toString() !== hoveredHandle.handlePoint.toString()) {
                previousHoverdHandle = hoveredHandle;
                const flowNodeComponent = PlaitElement.getComponent(hoveredHandle.node) as FlowNodeComponent;
                activeHandleElement?.remove();
                activeHandleElement = drawCircle(
                    PlaitBoard.getRoughSVG(board),
                    hoveredHandle.handlePoint,
                    HANDLE_DIAMETER + HANDLE_BUFFER,
                    {
                        ...DEFAULT_HANDLE_STYLES,
                        stroke: 'rgba(102, 152, 255, 0.3)',
                        strokeWidth: HANDLE_BUFFER
                    }
                );
                flowNodeComponent.g.append(activeHandleElement);
            }
            if (previousHoverdHandle && !hoveredHandle) {
                activeHandleElement?.remove();
                previousHoverdHandle = null;
            }
        }

        globalMousemove(event);
    };

    board.globalMouseup = (event: MouseEvent) => {
        globalMouseup(event);
        deleteHoverHandleInfo(board);
        if (hoveredHandle) {
            previousHoverdHandle = null;
            hoveredHandle = null;
            activeHandleElement?.remove();
        }
    };

    return board;
};
