import {
    PlaitBoard,
    PlaitPlugin,
    PlaitPluginElementContext,
    getMovingElements,
    PlaitElement,
    PlaitOptionsBoard,
    WithPluginOptions,
    PlaitPluginKey
} from '@plait/core';
import { FlowNodeComponent } from '../flow-node.component';
import { FlowEdgeComponent } from '../flow-edge.component';
import { isHitEdge } from '../utils/edge/is-hit-edge';
import { FlowElement } from '../interfaces/element';
import { FlowEdge } from '../interfaces/edge';
import { FlowNode } from '../interfaces/node';
import { withFlowEdgeDnd } from './with-edge-dnd';
import { getEdgesByNodeId } from '../utils/edge/get-edges-by-node';
import { withEdgeCreate } from './with-edge-create';
import { isHitNode } from '../utils/node/is-hit-node';
import { withHandleHover } from './with-handle-hover';
import { FlowPluginOptions, FlowPluginKey } from '../interfaces/flow';
import { TEXT_DEFAULT_HEIGHT } from '@plait/text';
import { withHoverDetect } from './with-hover-detect';

export const withFlow: PlaitPlugin = (board: PlaitBoard) => {
    const { drawElement, isHitSelection, isMovable, onChange, getRectangle } = board;

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
        if (!board.options.readonly) {
            const elementComponent = PlaitElement.getComponent(element) as FlowNodeComponent | FlowEdgeComponent;
            if (FlowElement.isFlowElement(element) && elementComponent && board.selection) {
                if (FlowNode.isFlowNodeElement(element)) {
                    return isHitNode(board, element, [range.anchor, range.focus]);
                }
                if (FlowEdge.isFlowEdgeElement(element)) {
                    return isHitEdge(board, element, range.focus);
                }
            }
        }
        return isHitSelection(element, range);
    };

    board.isMovable = element => {
        if (FlowNode.isFlowNodeElement(element as FlowElement)) {
            return true;
        }
        return isMovable(element);
    };

    board.getRectangle = element => {
        if (FlowNode.isFlowNodeElement(element as FlowElement)) {
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
            if (FlowNode.isFlowNodeElement(moveElement as FlowElement)) {
                const relationEdges = getEdgesByNodeId(board, moveElement.id);
                relationEdges.map(item => {
                    const flowEdgeComponent = PlaitElement.getComponent(item) as FlowEdgeComponent;
                    flowEdgeComponent.drawActiveElement();
                });
            }
        }
    };

    (board as PlaitOptionsBoard).setPluginOptions<WithPluginOptions>(PlaitPluginKey.withSelection, { isMultiple: false });

    (board as PlaitOptionsBoard).setPluginOptions<FlowPluginOptions>(FlowPluginKey.flowOptions, {
        edgeLabelOptions: { height: TEXT_DEFAULT_HEIGHT }
    });

    return withHoverDetect(withHandleHover(withFlowEdgeDnd(withEdgeCreate(board))));
};
