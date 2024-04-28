import { PlaitBoard, PlaitPlugin, PlaitElement, drawCircle, toHostPoint, toViewBoxPoint } from '@plait/core';
import { HitNodeHandle, getHitNodeHandle } from '../utils/handle/node';
import { addHoverHandleInfo, deleteHoverHandleInfo } from '../utils/handle/hover-handle';
import { DEFAULT_HANDLE_STYLES, HANDLE_BUFFER, HANDLE_DIAMETER } from '../constants/handle';
import { isEdgeDragging } from '../utils/edge/dragging-edge';
import { deleteCreateEdgeInfo, getCreateEdgeInfo } from '../utils/edge/create-edge';

export const withHandleBlink: PlaitPlugin = (board: PlaitBoard) => {
    const { globalPointerMove, globalPointerUp } = board;

    let previousHoveredHandle: HitNodeHandle | null = null;
    let hoveredHandle: HitNodeHandle | null;
    let activeHandleElement: SVGGElement;

    board.globalPointerMove = (event: PointerEvent) => {
        if (!board.options.readonly) {
            const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            hoveredHandle = getHitNodeHandle(board, point);
            addHoverHandleInfo(board, hoveredHandle);
            if (isEdgeDragging(board) || getCreateEdgeInfo(board)) {
                if (hoveredHandle && previousHoveredHandle?.handlePoint.toString() !== hoveredHandle.handlePoint.toString()) {
                    previousHoveredHandle = hoveredHandle;
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
                    activeHandleElement?.setAttribute('stroke-linecap', 'round');
                    PlaitElement.getElementG(hoveredHandle.node).append(activeHandleElement);
                }
                if (previousHoveredHandle && !hoveredHandle) {
                    activeHandleElement?.remove();
                    previousHoveredHandle = null;
                    deleteCreateEdgeInfo(board);
                }
            }
        }
        globalPointerMove(event);
    };

    board.globalPointerUp = (event: PointerEvent) => {
        globalPointerUp(event);
        deleteHoverHandleInfo(board);
        if (hoveredHandle) {
            previousHoveredHandle = null;
            hoveredHandle = null;
            activeHandleElement?.remove();
        }
    };

    return board;
};
