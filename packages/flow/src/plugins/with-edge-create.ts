import {
    BOARD_TO_HOST,
    PlaitBoard,
    PlaitPlugin,
    Point,
    isSelectedElement,
    toPoint,
    transformPoint,
    drawLine,
    idCreator,
    throttleRAF,
    removeSelectedElement,
    getSelectedElements,
    PlaitElement
} from '@plait/core';
import { FlowNode } from '../interfaces/node';
import { FlowNodeComponent } from '../flow-node.component';
import { FlowElementType } from '../interfaces/element';
import { isEdgeDragging } from '../utils/edge/dragging-edge';
import { FlowEdgeHandle } from '../interfaces/edge';
import { destroyAllNodesHandle, drawAllNodesHandle } from '../utils/node/render-all-nodes-handle';
import { addCreateEdgeInfo, deleteCreateEdgeInfo } from '../utils/edge/create-edge';
import { DEFAULT_PLACEHOLDER_ACTIVE_STYLES } from '../constants/edge';
import { getHitNodeHandle, getHitHandleByNode } from '../utils/handle/node';
import { getHitNode } from '../utils/node/get-hit-node';

export const withEdgeCreate: PlaitPlugin = (board: PlaitBoard) => {
    const { mousedown, globalMousemove, globalMouseup } = board;

    let sourceFlowNodeHandle: (FlowEdgeHandle & { handlePoint: Point }) | null = null;
    let targetFlowNodeHandle: (FlowEdgeHandle & { handlePoint: Point }) | null = null;
    let placeholderEdge: SVGElement;
    let flowNodeElements: FlowNode[] = [];
    let drawNodeHandles = true;
    let hoveredFlowNode: FlowNode | null;

    board.mousedown = event => {
        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        const selectElements = getSelectedElements(board);
        const flowNodeHandle = getHitNodeHandle(board, point);
        if (flowNodeHandle) {
            if (hoveredFlowNode && hoveredFlowNode.id === flowNodeHandle.node.id) {
                sourceFlowNodeHandle = flowNodeHandle;
                selectElements.map(item => {
                    removeSelectedElement(board, item);
                });
            }
        }
        mousedown(event);
    };

    board.globalMousemove = (event: MouseEvent) => {
        if (sourceFlowNodeHandle) {
            const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            placeholderEdge?.remove();
            throttleRAF(() => {
                if (sourceFlowNodeHandle) {
                    placeholderEdge = drawLine(
                        PlaitBoard.getRoughSVG(board),
                        sourceFlowNodeHandle.handlePoint,
                        point,
                        DEFAULT_PLACEHOLDER_ACTIVE_STYLES
                    );
                }
                BOARD_TO_HOST.get(board)?.append(placeholderEdge);
                if (drawNodeHandles) {
                    drawNodeHandles = false;
                    flowNodeElements = drawAllNodesHandle(board);
                }
            });

            if (placeholderEdge) {
                targetFlowNodeHandle = null;
                targetFlowNodeHandle = getHitNodeHandle(board, point);
                if (targetFlowNodeHandle && targetFlowNodeHandle.handlePoint.toString() !== sourceFlowNodeHandle.handlePoint.toString()) {
                    addCreateEdgeInfo(board, {
                        id: idCreator(),
                        type: FlowElementType.edge,
                        source: {
                            id: sourceFlowNodeHandle.node.id,
                            position: sourceFlowNodeHandle.position
                        },
                        target: {
                            id: targetFlowNodeHandle.node.id,
                            position: targetFlowNodeHandle.position,
                            marker: 'arrow'
                        }
                    });
                }
            }
            return;
        } else {
            // 鼠标移入 flowNode 展示 handles
            const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            const hitNode = getHitNode(board, point);
            if (hitNode) {
                hoveredFlowNode = hitNode;
            }
            if (hoveredFlowNode) {
                const isSelected = isSelectedElement(board, hoveredFlowNode);
                const flowNodeComponent = PlaitElement.getComponent(hoveredFlowNode) as FlowNodeComponent;
                if (!isSelected && !isEdgeDragging(board)) {
                    if (hitNode) {
                        flowNodeComponent.drawHandles(hoveredFlowNode);
                    } else {
                        const hitNodeHandle = getHitHandleByNode(hoveredFlowNode, point);
                        if (!hitNodeHandle) {
                            flowNodeComponent.destroyHandles();
                            hoveredFlowNode = null;
                        }
                    }
                }
            }
        }
        globalMousemove(event);
    };

    board.globalMouseup = (event: MouseEvent) => {
        globalMouseup(event);
        if (placeholderEdge) {
            sourceFlowNodeHandle = null;
            targetFlowNodeHandle = null;
            placeholderEdge?.remove();
            deleteCreateEdgeInfo(board);
            drawNodeHandles = true;
            destroyAllNodesHandle(board, flowNodeElements);
            flowNodeElements = [];
            hoveredFlowNode = null;
        }
    };

    return board;
};
