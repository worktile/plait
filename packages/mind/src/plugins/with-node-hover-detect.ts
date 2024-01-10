import { PlaitBoard } from '@plait/core';
import { NodeHoveredExtendRef, pointerLeaveHandle, pointerMoveHandle } from '../utils/node-hover/extend';

export const withNodeHoverDetect = (board: PlaitBoard) => {
    const { pointerMove, pointerLeave } = board;
    let nodeHoveredExtendRef: NodeHoveredExtendRef | null = null;

    board.pointerMove = (event: PointerEvent) => {
        nodeHoveredExtendRef = pointerMoveHandle(board, event, nodeHoveredExtendRef);
        pointerMove(event);
    };

    board.pointerLeave = (event: PointerEvent) => {
        pointerLeaveHandle(board, event, nodeHoveredExtendRef);
        nodeHoveredExtendRef = null;
        pointerLeave(event);
    };

    return board;
};
