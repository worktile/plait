import {
    BOARD_TO_HOST,
    ELEMENT_TO_PLUGIN_COMPONENT,
    IS_TEXT_EDITABLE,
    Path,
    PlaitBoard,
    PlaitPlugin,
    Point,
    Transforms,
    isSelectedElement,
    toPoint,
    transformPoint
} from '@plait/core';
import { FlowNodeComponent } from '../flow-node.component';
import { FlowEdgeComponent } from '../flow-edge.component';
import { FlowElement } from '../interfaces/element';
import { FlowEdge, FlowEdgeDragInfo, FlowEdgeHandleType } from '../interfaces/edge';
import { isHitFlowEdge } from '../utils/edge/is-hit-edge-element';
import { getHandleType } from '../utils/handle/get-handle-type';
import { FlowNode } from '../interfaces/node';
import { Element } from 'slate';
import { getHitNodeHandle } from '../utils/edge/get-hit-node-handle';
import { FlowEdgeHandle } from '@plait/flow';

export const FLOW_EDGE_DRAGING_INFO: WeakMap<FlowElement, FlowEdgeDragInfo> = new WeakMap();

export const withFlowEdgeDnd: PlaitPlugin = (board: PlaitBoard) => {
    const { mousedown, mousemove, globalMouseup } = board;

    let isDragging = false;
    let activeElement: FlowEdge<Element> | null;
    let activeComponent: FlowEdgeComponent | null;
    let startPoint: Point | null;
    let handleType: FlowEdgeHandleType | null;
    let offsetX: number = 0;
    let offsetY: number = 0;
    let flowNodeElements: FlowNode[] = [];
    let path: Path = [];
    let hitNodeHandle: FlowEdgeHandle | null = null;
    let isShowNodeEdge = false;

    board.mousedown = (event: MouseEvent) => {
        if (board.options.readonly || IS_TEXT_EDITABLE.get(board) || event.button === 2) {
            mousedown(event);
            return;
        }
        const host = BOARD_TO_HOST.get(board);
        const point = transformPoint(board, toPoint(event.x, event.y, host!));
        (board.children as FlowElement[]).forEach((value, index) => {
            if (FlowEdge.isFlowEdgeElement<Element>(value) && board.selection) {
                const flowEdgeComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(value) as FlowEdgeComponent;
                const hitFlowEdge = isHitFlowEdge(board, value, board.selection.focus);
                if (hitFlowEdge) {
                    activeComponent = flowEdgeComponent;
                    activeElement = value as FlowEdge<Element>;
                    startPoint = point;
                    handleType = getHandleType(board, point, value);
                    path = [index];
                }
            }
        });
        mousedown(event);
    };

    board.mousemove = (event: MouseEvent) => {
        if (!board.options.readonly && startPoint) {
            const host = BOARD_TO_HOST.get(board);
            const endPoint = transformPoint(board, toPoint(event.x, event.y, host!));
            if (!isDragging) {
                isDragging = true;
            } else {
                offsetX = endPoint[0] - startPoint[0];
                offsetY = endPoint[1] - startPoint[1];
                if (activeElement && FlowEdge.isFlowEdgeElement(activeElement) && handleType) {
                    FLOW_EDGE_DRAGING_INFO.set(activeElement, {
                        offsetX,
                        offsetY,
                        handleType
                    });
                    activeComponent?.updateElement(activeElement, true);
                    hitNodeHandle = getHitNodeHandle(board, activeElement, endPoint);
                    if (!isShowNodeEdge) {
                        isShowNodeEdge = true;
                        // 所有的 node 节点显示 handle
                        flowNodeElements = board.children.filter(item => FlowNode.isFlowNodeElement(item)) as FlowNode[];
                        flowNodeElements.map(item => {
                            const flowNodeComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(item) as FlowNodeComponent;
                            flowNodeComponent.drawHandles();
                        });
                    }
                    if (!hitNodeHandle) {
                        FLOW_EDGE_DRAGING_INFO.delete(activeElement);
                    }
                }
            }
        }
        mousemove(event);
    };

    board.globalMouseup = (event: MouseEvent) => {
        if (!board.options.readonly && activeElement && FlowEdge.isFlowEdgeElement(activeElement) && handleType) {
            if (hitNodeHandle) {
                const { position, offsetX: handleOffsetX, offsetY: handleOffsetY, node } = hitNodeHandle;
                Transforms.setNode(
                    board,
                    {
                        [handleType]: {
                            ...activeElement[handleType],
                            id: node.id,
                            position,
                            offsetX: handleOffsetX,
                            offsetY: handleOffsetY
                        }
                    },
                    path
                );
            }
            if (isShowNodeEdge) {
                flowNodeElements.map(item => {
                    const flowNodeComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(item) as FlowNodeComponent;
                    flowNodeComponent.destroyHandles();
                    if (isSelectedElement(board, item)) {
                        flowNodeComponent.destroyActiveMask();
                    }
                });
            }
            FLOW_EDGE_DRAGING_INFO.delete(activeElement);
        }
        isDragging = false;
        activeElement = null;
        activeComponent = null;
        startPoint = null;
        handleType = null;
        offsetX = 0;
        offsetY = 0;
        flowNodeElements = [];
        path = [];
        isShowNodeEdge = false;
        globalMouseup(event);
    };
    return board;
};
