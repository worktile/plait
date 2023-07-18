import { PlaitElement, PlaitPlugin, getMovingElements } from '@plait/core';
import { FlowEdgeComponent, FlowElement, FlowNode, getEdgesByNodeId } from '@plait/flow';
import { CustomBoard } from '../interfaces/board';

export const withMoving: PlaitPlugin = (board: CustomBoard) => {
    const { globalMouseup } = board;

    board.globalMouseup = event => {
        const movingNodes = getMovingElements(board);
        if (movingNodes?.length) {
            const moveElement = movingNodes[0];
            if (FlowNode.isFlowNodeElement(moveElement as FlowElement)) {
                const relationEdges = getEdgesByNodeId(board, moveElement.id);
                relationEdges.map(item => {
                    const flowEdgeComponent = PlaitElement.getComponent(item) as FlowEdgeComponent;
                    flowEdgeComponent.drawElement();
                });
            }
        }
        globalMouseup(event);
    };

    return board;
};
