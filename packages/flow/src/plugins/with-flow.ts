import { PlaitBoard, PlaitPlugin, PlaitPluginElementContext, ELEMENT_TO_COMPONENT, getMovingElements } from '@plait/core';
import { FlowNodeComponent } from '../flow-node.component';
import { FlowEdgeComponent } from '../flow-edge.component';
import { isHitFlowEdge } from '../utils/edge/is-hit-edge-element';
import { FlowElement } from '../interfaces/element';
import { FlowEdge } from '../interfaces/edge';
import { FlowNode } from '../interfaces/node';
import { withFlowEdgeDnd } from './with-edge-dnd';
import { getEdgesByNodeId } from '../utils/edge/get-edges-by-node';
import { withEdgeCreate } from './with-edge-create';
import { isHitFlowNode } from '../utils/node/is-hit-node';

export const withFlow: PlaitPlugin = (board: PlaitBoard) => {
    const { drawElement, isHitSelection, isMovable, onChange, getRectangle, mousemove } = board;

    board.drawElement = (context: PlaitPluginElementContext) => {
        if (FlowElement.isFlowElement(context.element)) {
            if (FlowEdge.isFlowEdgeElement(context.element)) {
                return FlowEdgeComponent;
            }
            return FlowNodeComponent;
        }
        return drawElement(context);
    };

    board.isHitSelection = (element, range) => {
        const elementComponent = ELEMENT_TO_COMPONENT.get(element) as FlowNodeComponent | FlowEdgeComponent;
        if (FlowElement.isFlowElement(element) && elementComponent && board.selection) {
            if (FlowNode.isFlowNodeElement(element)) {
                return isHitFlowNode(board, element, [range.anchor, range.focus]);
            }
            if (FlowEdge.isFlowEdgeElement(element)) {
                return isHitFlowEdge(board, element, range.focus);
            }
        }
        return isHitSelection(element, range);
    };

    board.isMovable = element => {
        if (FlowNode.isFlowNodeElement(element)) {
            return true;
        }
        return isMovable(element);
    };

    board.getRectangle = element => {
        if (FlowNode.isFlowNodeElement(element)) {
            const { width, height, points } = element;
            return {
                x: points![0][0],
                y: points![0][1],
                width,
                height
            };
        }
        return getRectangle(element);
    };

    board.onChange = () => {
        onChange();
        const movingNodes = getMovingElements(board);
        if (movingNodes?.length) {
            const moveElement = movingNodes[0];
            if (FlowNode.isFlowNodeElement(moveElement)) {
                const relationEdges = getEdgesByNodeId(board, moveElement.id);
                relationEdges.map(item => {
                    const flowEdgeComponent = ELEMENT_TO_COMPONENT.get(item) as FlowEdgeComponent;
                    flowEdgeComponent.drawElement();
                });
            }
        }
    };

    return withFlowEdgeDnd(withEdgeCreate(board));
};
