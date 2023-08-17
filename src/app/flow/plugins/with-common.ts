import { PlaitPlugin, Transforms, addSelectedElement, clearSelectedElement, getSelectedElements, hotkeys } from '@plait/core';
import { FlowEdge, FlowElement, FlowNode, createFlowEdge, getCreateEdgeInfo, getEdgesByNodeId, getFlowNodeById } from '@plait/flow';
import { Element, Text } from 'slate';
import { CustomBoard } from '../interfaces/board';

export const withCommon: PlaitPlugin = (board: CustomBoard) => {
    const { mouseup, keydown } = board;

    board.mouseup = event => {
        const newEdge = getCreateEdgeInfo(board);
        if (newEdge) {
            const sourceNode = getFlowNodeById(board, newEdge?.source?.nodeId!);
            const targetNode = getFlowNodeById(board, newEdge?.target?.nodeId!);
            const sourceNodeText = ((sourceNode.data?.text as Element).children[0] as Text).text;
            const targetNodeText = ((targetNode.data?.text as Element).children[0] as Text).text;
            clearSelectedElement(board);
            createFlowEdge(
                board,
                {
                    text: {
                        children: [{ text: `从${sourceNodeText}到${targetNodeText}` }]
                    }
                },
                newEdge
            );
            const node = board.children[0];
            addSelectedElement(board, node);
        }
        mouseup(event);
    };

    board.keydown = (event: KeyboardEvent) => {
        const selectedElements = getSelectedElements(board);
        if (selectedElements.length) {
            if (hotkeys.isDeleteBackward(event) || hotkeys.isDeleteForward(event)) {
                event.preventDefault();
                const deleteElement = selectedElements[0] as FlowElement;
                const path = board.children.findIndex(item => item.id === deleteElement.id);
                if (FlowEdge.isFlowEdgeElement(deleteElement)) {
                    if (!deleteElement.undeletable) {
                        // 删除 edge
                        Transforms.removeNode(board, [path]);
                        return;
                    }
                }
                if (FlowNode.isFlowNodeElement(deleteElement)) {
                    const edges = getEdgesByNodeId(board, deleteElement.id);
                    if (!deleteElement.undeletable) {
                        // 删除 node
                        Transforms.removeNode(board, [path]);
                        // 删除与 node 相关连的 edge
                        edges.map(edge => {
                            const edgePath = board.children.findIndex(item => item.id === edge.id);
                            !edge.undeletable && Transforms.removeNode(board, [edgePath]);
                        });
                        return;
                    }
                }
            }
        }
        keydown(event);
    };

    return board;
};
