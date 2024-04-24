import { PlaitBoard, PlaitPlugin, PlaitElement } from '@plait/core';
import { FlowElement } from '../interfaces/element';
import { FlowNode } from '../interfaces/node';
import { getEdgesByNodeId } from '../utils/edge/get-edges-by-node';

export const withFlowSelection: PlaitPlugin = (board: PlaitBoard) => {
    const { getRelatedSelectionFragment } = board;

    board.getRelatedSelectionFragment = (data: PlaitElement[], originData?: PlaitElement[]) => {
        if (originData) {
            const relatedEdges: PlaitElement[] = [];
            originData
                .filter(item => FlowElement.isFlowElement(item) && FlowNode.isFlowNodeElement(item))
                .forEach(item => {
                    const edges = getEdgesByNodeId(board, item.id);
                    relatedEdges.push(...edges);
                });
            return getRelatedSelectionFragment([...data, ...relatedEdges], originData);
        }
        return getRelatedSelectionFragment(data, originData);
    };

    return board;
};
