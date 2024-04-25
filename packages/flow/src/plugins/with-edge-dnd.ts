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
    toHostPoint,
    toViewBoxPoint
} from '@plait/core';
import { FlowEdgeComponent } from '../flow-edge.component';
import { FlowEdge, FlowEdgeHandleType } from '../interfaces/edge';
import { FlowNode } from '../interfaces/node';
import { deleteEdgeDraggingInfo, addEdgeDraggingInfo } from '../utils/edge/dragging-edge';
import { destroyAllNodesHandle, drawAllNodesHandle } from '../utils/node/render-all-nodes-handle';
import { HitNodeHandle } from '../utils/handle/node';
import { getHitHandleTypeByEdge } from '../utils/handle/edge';
import { getHoverHandleInfo } from '../utils/handle/hover-handle';
import { FlowElement } from '../interfaces/element';
import { FlowRenderMode } from '../interfaces/flow';
import { EdgeElementRef } from '../core/edge-ref';
import { PlaitFlowBoard } from '../interfaces';
import { EdgeGenerator } from '../generators/edge-generator';

export const withFlowEdgeDnd: PlaitPlugin = (board: PlaitBoard) => {
    const { pointerDown, pointerMove, globalPointerUp } = board;

    let activeElement: FlowEdge | null;
    let startPoint: Point | null;
    let handleType: FlowEdgeHandleType | null;
    let offsetX: number = 0;
    let offsetY: number = 0;
    let flowNodeElements: FlowNode[] = [];
    let hitNodeHandle: HitNodeHandle | null = null;
    let drawNodeHandles = true;

    board.pointerDown = (event: PointerEvent) => {
        if (board.options.readonly || IS_TEXT_EDITABLE.get(board) || event.button === 2) {
            pointerDown(event);
            return;
        }
        const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        const selectElements = getSelectedElements(board);
        if (selectElements.length && FlowEdge.isFlowEdgeElement(selectElements[0] as FlowElement)) {
            activeElement = selectElements[0] as FlowEdge;
            handleType = getHitHandleTypeByEdge(board, point, activeElement);
            if (handleType) {
                startPoint = point;
                return;
            }
        }
        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        if (!board.options.readonly && startPoint && handleType) {
            const endPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            offsetX = endPoint[0] - startPoint[0];
            offsetY = endPoint[1] - startPoint[1];
            event.preventDefault();
            if (activeElement) {
                throttleRAF(board, 'with-flow-edge-dnd', () => {
                    if (!activeElement) {
                        return;
                    }
                    addEdgeDraggingInfo(activeElement!, {
                        offsetX,
                        offsetY,
                        handleType: handleType!
                    });
                    const edgeRef = PlaitElement.getElementRef<EdgeElementRef>(activeElement);
                    edgeRef.buildPathPoints(board as PlaitFlowBoard, activeElement);
                    const edgeGenerator = edgeRef.getGenerator<EdgeGenerator>(EdgeGenerator.key);
                    edgeGenerator.processDrawing(activeElement, PlaitElement.getElementG(activeElement), { selected: true, hovered: false });
                    hitNodeHandle = getHoverHandleInfo(board) as HitNodeHandle;
                    if (drawNodeHandles) {
                        drawNodeHandles = false;
                        // 所有的 node 节点显示 handle
                        flowNodeElements = drawAllNodesHandle(board);
                    }
                });
            }
        }
        pointerMove(event);
    };

    board.globalPointerUp = (event: PointerEvent) => {
        if (!board.options.readonly && handleType && activeElement) {
            const activeComponent = PlaitElement.getComponent(activeElement) as FlowEdgeComponent;
            const activePath = PlaitBoard.findPath(board, activeElement);
            deleteEdgeDraggingInfo(activeElement);
            if (hitNodeHandle) {
                const { position, handleId, offsetX: handleOffsetX, offsetY: handleOffsetY, node } = hitNodeHandle;
                Transforms.setNode(
                    board,
                    {
                        [handleType]: {
                            ...activeElement[handleType],
                            nodeId: node.id,
                            position,
                            handleId,
                            offsetX: handleOffsetX,
                            offsetY: handleOffsetY
                        }
                    },
                    activePath
                );
            } else {
                const edgeRef = PlaitElement.getElementRef<EdgeElementRef>(activeElement);
                const edgeGenerator = edgeRef.getGenerator<EdgeGenerator>(EdgeGenerator.key);
                edgeGenerator.processDrawing(activeElement, PlaitElement.getElementG(activeElement), { selected: true, hovered: false });
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
        globalPointerUp(event);
    };
    return board;
};
