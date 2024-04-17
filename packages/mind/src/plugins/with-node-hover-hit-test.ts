import { PlaitBoard, PlaitElement, throttleRAF } from '@plait/core';
import { NodeExtendHoveredRef, pointerLeaveHandle, pointerMoveHandle } from '../utils/node-hover/extend';

export const withNodeHoverHitTest = (board: PlaitBoard) => {
    const { pointerMove, pointerLeave } = board;
    let nodeExtendHoveredRef: NodeExtendHoveredRef | null = null;

    board.pointerMove = (event: PointerEvent) => {
        throttleRAF(board, 'with-mind-node-hover-hit-test', () => {
            // element has been deleted
            if (nodeExtendHoveredRef && !PlaitElement.hasMounted(nodeExtendHoveredRef.element)) {
                nodeExtendHoveredRef = null;
            }
            nodeExtendHoveredRef = pointerMoveHandle(board, event, nodeExtendHoveredRef);
        });
        pointerMove(event);
    };

    board.pointerLeave = (event: PointerEvent) => {
        pointerLeaveHandle(board, event, nodeExtendHoveredRef);
        nodeExtendHoveredRef = null;
        pointerLeave(event);
    };

    return board;
};
