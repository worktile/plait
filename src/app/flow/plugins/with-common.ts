import { PlaitBoard, PlaitPlugin } from '@plait/core';
import { createFlowEdge, getCreateEdgeInfo, getFlowNodeById } from '@plait/flow';
import { Element, Text } from 'slate';

export const withCommon: PlaitPlugin = (board: PlaitBoard) => {
    const { mouseup } = board;

    board.mouseup = event => {
        const newEdge = getCreateEdgeInfo(board);
        if (newEdge) {
            const sourceNode = getFlowNodeById(board, newEdge?.source?.id!);
            const targetNode = getFlowNodeById(board, newEdge?.target?.id!);
            const sourceNodeText = ((sourceNode.data?.text as Element).children[0] as Text).text;
            const targetNodeText = ((targetNode.data?.text as Element).children[0] as Text).text;
            createFlowEdge(
                board,
                {
                    text: {
                        children: [{ text: `从${sourceNodeText}到${targetNodeText}` }]
                    }
                },
                newEdge
            );
        }
        mouseup(event);
    };

    return board;
};
