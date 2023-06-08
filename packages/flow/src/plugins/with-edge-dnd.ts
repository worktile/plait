import {
    BOARD_TO_HOST,
    IS_TEXT_EDITABLE,
    PlaitBoard,
    PlaitElement,
    PlaitPlugin,
    Point,
    Transforms,
    getSelectedElements,
    throttleRAF,
    toPoint,
    transformPoint
} from '@plait/core';
import { FlowEdgeComponent } from '../flow-edge.component';
import { FlowEdge, FlowEdgeHandleRef, FlowEdgeHandleType } from '../interfaces/edge';
import { FlowNode } from '../interfaces/node';
import { deleteEdgeDraggingInfo, addEdgeDraggingInfo } from '../utils/edge/dragging-edge';
import { destroyAllNodesHandle, drawAllNodesHandle } from '../utils/node/render-all-nodes-handle';
import { getHitNodeHandle } from '../utils/handle/node';
import { getHitHandleTypeByEdge } from '../utils/handle/edge';

export const withFlowEdgeDnd: PlaitPlugin = (board: PlaitBoard) => {
    const { mousedown, mousemove, globalMouseup } = board;

    let activeElement: FlowEdge | null;
    let startPoint: Point | null;
    let handleType: FlowEdgeHandleType | null;
    let offsetX: number = 0;
    let offsetY: number = 0;
    let flowNodeElements: FlowNode[] = [];
    let hitNodeHandle: FlowEdgeHandleRef | null = null;
    let drawNodeHandles = true;

    board.mousedown = (event: MouseEvent) => {
        if (board.options.readonly || IS_TEXT_EDITABLE.get(board) || event.button === 2) {
            mousedown(event);
            return;
        }
        const host = BOARD_TO_HOST.get(board);
        const point = transformPoint(board, toPoint(event.x, event.y, host!));
        const selectElements = getSelectedElements(board);
        if (selectElements.length && FlowEdge.isFlowEdgeElement(selectElements[0])) {
            activeElement = selectElements[0] as FlowEdge;
            handleType = getHitHandleTypeByEdge(board, point, activeElement);
            if (handleType) {
                startPoint = point;
                return;
            }
        }
        mousedown(event);
    };

    board.mousemove = (event: MouseEvent) => {
        if (!board.options.readonly && startPoint && handleType) {
            const host = BOARD_TO_HOST.get(board);
            const endPoint = transformPoint(board, toPoint(event.x, event.y, host!));
            offsetX = endPoint[0] - startPoint[0];
            offsetY = endPoint[1] - startPoint[1];
            if (activeElement) {
                addEdgeDraggingInfo(activeElement, {
                    offsetX,
                    offsetY,
                    handleType
                });
                throttleRAF(() => {
                    const activeComponent = activeElement && (PlaitElement.getComponent(activeElement) as FlowEdgeComponent);
                    activeComponent?.updateElement(activeElement!, true);
                    hitNodeHandle = getHitNodeHandle(board, endPoint);
                    if (drawNodeHandles) {
                        drawNodeHandles = false;
                        // 所有的 node 节点显示 handle
                        flowNodeElements = drawAllNodesHandle(board);
                    }
                });
            }
        }
        mousemove(event);
    };

    board.globalMouseup = (event: MouseEvent) => {
        if (!board.options.readonly && handleType && activeElement) {
            const activeComponent = PlaitElement.getComponent(activeElement) as FlowEdgeComponent;
            const activePath = PlaitBoard.findPath(board, activeElement);
            deleteEdgeDraggingInfo(activeElement);
            if (hitNodeHandle) {
                const { position, offsetX: handleOffsetX, offsetY: handleOffsetY, node } = hitNodeHandle;
                Transforms.setNode(
                    board,
                    {
                        [handleType]: {
                            ...activeElement[handleType],
                            nodeId: node.id,
                            position,
                            offsetX: handleOffsetX,
                            offsetY: handleOffsetY
                        }
                    },
                    activePath
                );
            } else {
                activeComponent?.drawElement(activeElement, true);
            }
            destroyAllNodesHandle(board, flowNodeElements);
        }
        activeElement = null;
        startPoint = null;
        handleType = null;
        offsetX = 0;
        offsetY = 0;
        flowNodeElements = [];
        drawNodeHandles = true;
        globalMouseup(event);
    };
    return board;
};
