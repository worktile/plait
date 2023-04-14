import {
    BOARD_TO_HOST,
    ELEMENT_TO_PLUGIN_COMPONENT,
    PlaitBoard,
    PlaitPlugin,
    Point,
    isSelectedElement,
    toPoint,
    transformPoint,
    drawLine
} from '@plait/core';
import { FlowNode } from '../interfaces/node';
import { FlowNodeComponent } from '../flow-node.component';
import { isHitFlowNode } from '../utils/node/is-hit-node';
import { FlowElement, FlowElementType, FlowHandle } from '../interfaces/element';
import { Element } from 'slate';
import { isEdgeDraging } from '../utils/edge/draging-edge';
import { getHitFlowNodeHandle } from '../utils/handle/get-hit-node-handle';
import { FlowEdgeInfo } from '../interfaces/edge';
import { getFlowElementsByType } from '../utils/get-node-by-id';
import { renderAllNodesHandle } from '../utils/node/render-all-nodes-handle';

export const withEdgeCreate: PlaitPlugin = (board: PlaitBoard) => {
    const { mousedown, mousemove, mouseup } = board;

    let edgeSource: FlowEdgeInfo | null;
    let edgeTarget: FlowEdgeInfo | null;
    let hitFlowNodeHandle: (FlowHandle & { handlePoint: Point }) | null = null;
    let edgePoints: Point[] = [];
    let placeholderEdge: SVGElement;
    let flowNodeElements: FlowNode[] = [];

    board.mousedown = event => {
        const nodes = getFlowElementsByType(board, FlowElementType.node) as FlowNode[];
        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        nodes.map(value => {
            if (!hitFlowNodeHandle) {
                hitFlowNodeHandle = getHitFlowNodeHandle(value, point);
            } else {
                edgeSource = {
                    id: value.id,
                    position: hitFlowNodeHandle.position
                };
            }
        });
        if (edgeSource) {
            return;
        }
        mousedown(event);
    };

    board.mousemove = (event: MouseEvent) => {
        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        (board.children as FlowElement[]).forEach((value, index) => {
            if (FlowNode.isFlowNodeElement<Element>(value) && board.selection) {
                const flowEdgeComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(value) as FlowNodeComponent;
                const hitFlowNode = isHitFlowNode(board, value, [point, point]);
                const isSelected = isSelectedElement(board, value);
                if (!isSelected && !isEdgeDraging(board)) {
                    if (hitFlowNode) {
                        flowEdgeComponent.drawHandles(value);
                    } else if (!getHitFlowNodeHandle(value, point)) {
                        flowEdgeComponent.destroyHandles();
                    }
                }
            }
        });
        if (edgeSource && hitFlowNodeHandle) {
            placeholderEdge?.remove();
            placeholderEdge = drawLine(PlaitBoard.getRoughSVG(board), hitFlowNodeHandle.handlePoint, point, {
                stroke: '#6698FF',
                strokeWidth: 1,
                strokeLineDash: [5]
            });
            BOARD_TO_HOST.get(board)?.append(placeholderEdge);
            flowNodeElements = renderAllNodesHandle(board);
        }
        mousemove(event);
    };

    board.mouseup = (event: MouseEvent) => {
        if (placeholderEdge) {
            edgeSource = null;
            flowNodeElements = [];
        }

        mouseup(event);
    };

    return board;
};
