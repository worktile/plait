import {
    BOARD_TO_HOST,
    ELEMENT_TO_PLUGIN_COMPONENT,
    IS_TEXT_EDITABLE,
    Path,
    PlaitBoard,
    PlaitPlugin,
    Point,
    Transforms,
    toPoint,
    transformPoint
} from '@plait/core';
import { FlowEdgeComponent } from '../flow-edge.component';
import { FlowElement } from '../interfaces/element';
import { FlowEdge, FlowEdgeHandle, FlowEdgeHandleType } from '../interfaces/edge';
import { isHitFlowEdge } from '../utils/edge/is-hit-edge-element';
import { getHandleType } from '../utils/handle/get-handle-type';
import { FlowNode } from '../interfaces/node';
import { Element } from 'slate';
import { getHitNodeHandleByEdge } from '../utils/handle/get-hit-node-handle-by-edge';
import { deleteEdgeDraggingInfo, addEdgeDraggingInfo } from '../utils/edge/dragging-edge';
import { destroyAllNodesHandle, drawAllNodesHandle } from '../utils/node/render-all-nodes-handle';

export const withFlowEdgeDnd: PlaitPlugin = (board: PlaitBoard) => {
    const { mousedown, mousemove, globalMouseup } = board;

    let activeElement: FlowEdge | null;
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
            if (FlowEdge.isFlowEdgeElement(value) && board.selection) {
                const flowEdgeComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(value) as FlowEdgeComponent;
                const hitFlowEdge = isHitFlowEdge(board, value, board.selection.ranges[0].focus);
                if (hitFlowEdge) {
                    activeComponent = flowEdgeComponent;
                    activeElement = value as FlowEdge;
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
            offsetX = endPoint[0] - startPoint[0];
            offsetY = endPoint[1] - startPoint[1];
            if (activeElement && FlowEdge.isFlowEdgeElement(activeElement) && handleType) {
                addEdgeDraggingInfo(activeElement, {
                    offsetX,
                    offsetY,
                    handleType
                });
                activeComponent?.updateElement(activeElement, true);
                hitNodeHandle = getHitNodeHandleByEdge(board, activeElement, endPoint);
                if (!isShowNodeEdge) {
                    isShowNodeEdge = true;
                    // 所有的 node 节点显示 handle
                    flowNodeElements = drawAllNodesHandle(board);
                }
            }
        }
        mousemove(event);
    };

    board.globalMouseup = (event: MouseEvent) => {
        if (!board.options.readonly && startPoint && activeElement && FlowEdge.isFlowEdgeElement(activeElement) && handleType) {
            deleteEdgeDraggingInfo(activeElement);
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
            } else {
                activeComponent?.drawElement(activeElement, true);
            }
            if (isShowNodeEdge) {
                destroyAllNodesHandle(board, flowNodeElements);
            }
        }
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
