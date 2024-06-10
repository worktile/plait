import {
    PlaitBoard,
    PlaitPlugin,
    PlaitPluginElementContext,
    PlaitElement,
    PlaitOptionsBoard,
    WithPluginOptions,
    PlaitPluginKey
} from '@plait/core';
import { FlowNodeComponent } from '../node.component';
import { FlowEdgeComponent } from '../edge.component';
import { isHitEdge } from '../utils/edge/is-hit-edge';
import { FlowElement } from '../interfaces/element';
import { FlowEdge } from '../interfaces/edge';
import { FlowNode } from '../interfaces/node';
import { withFlowEdgeDnd } from './with-edge-dnd';
import { withEdgeCreate } from './with-edge-create';
import { isHitNode } from '../utils/node/is-hit-node';
import { withHandleBlink } from './with-handle-blink';
import { FlowPluginOptions, FlowPluginKey } from '../interfaces/flow';
import { withHovering } from './with-hovering';
import { TEXT_DEFAULT_HEIGHT } from '@plait/text-plugins';
import { withLabelIcon } from './with-label-icon';

export const withFlow: PlaitPlugin = (board: PlaitBoard) => {
    const { drawElement, isRectangleHit, isHit, isMovable, getRectangle } = board;

    board.drawElement = (context: PlaitPluginElementContext) => {
        if (FlowElement.isFlowElement(context.element)) {
            if (FlowEdge.isFlowEdgeElement(context.element)) {
                return FlowEdgeComponent;
            }
            return FlowNodeComponent;
        }
        return drawElement(context);
    };

    board.isRectangleHit = (element, range) => {
        if (!board.options.readonly) {
            if (FlowElement.isFlowElement(element) && PlaitElement.hasMounted(element) && board.selection) {
                if (FlowNode.isFlowNodeElement(element)) {
                    return isHitNode(board, element, [range.anchor, range.focus]);
                }
                if (FlowEdge.isFlowEdgeElement(element)) {
                    return isHitEdge(board, element, range.focus);
                }
            }
        }
        return isRectangleHit(element, range);
    };

    board.isHit = (element, point) => {
        if (!board.options.readonly) {
            if (FlowElement.isFlowElement(element) && PlaitElement.hasMounted(element)) {
                if (FlowNode.isFlowNodeElement(element)) {
                    return isHitNode(board, element, [point, point]);
                }
                if (FlowEdge.isFlowEdgeElement(element)) {
                    return isHitEdge(board, element, point);
                }
            }
        }
        return isHit(element, point);
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
        if (FlowEdge.isFlowEdgeElement(element as FlowElement)) {
            return {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            };
        }
        return getRectangle(element);
    };

    (board as PlaitOptionsBoard).setPluginOptions<WithPluginOptions>(PlaitPluginKey.withSelection, { isMultiple: false });

    (board as PlaitOptionsBoard).setPluginOptions<FlowPluginOptions>(FlowPluginKey.flowOptions, {
        edgeLabelOptions: { height: TEXT_DEFAULT_HEIGHT }
    });

    return withLabelIcon(withHandleBlink(withFlowEdgeDnd(withEdgeCreate(withHovering(board)))));
};
