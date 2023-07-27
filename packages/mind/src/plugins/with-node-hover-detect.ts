import { PlaitBoard } from '@plait/core';
import { NodeHoveredExtendRef, mouseLeaveHandle, mouseMoveHandle } from '../utils/node-hover/extend';

export const withNodeHoverDetect = (board: PlaitBoard) => {
    const { mousemove, mouseleave } = board;
    let nodeHoveredExtendRef: NodeHoveredExtendRef | null = null;

    board.mousemove = (event: MouseEvent) => {
        nodeHoveredExtendRef = mouseMoveHandle(board, event, nodeHoveredExtendRef);

        mousemove(event);
    };

    board.mouseleave = (event: MouseEvent) => {
        mouseLeaveHandle(board, event, nodeHoveredExtendRef);
        nodeHoveredExtendRef = null;

        mouseleave(event);
    };

    return board;
};
