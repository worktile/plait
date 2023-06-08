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
import { FlowEdgeHandleRef } from '../interfaces/edge';
import { destroyAllNodesHandle, drawAllNodesHandle } from '../utils/node/render-all-nodes-handle';
import { addCreateEdgeInfo, deleteCreateEdgeInfo } from '../utils/edge/create-edge';
import { DEFAULT_PLACEHOLDER_ACTIVE_STYLES } from '../constants/edge';
import { getHitNodeHandle, getHitHandleByNode } from '../utils/handle/node';
import { getHitNode } from '../utils/node/get-hit-node';

export const withEdgeCreate: PlaitPlugin = (board: PlaitBoard) => {
    const { mousedown, globalMousemove, globalMouseup } = board;

    let sourceFlowNodeHandle: (FlowEdgeHandleRef & { handlePoint: Point }) | null = null;
    let targetFlowNodeHandle: (FlowEdgeHandleRef & { handlePoint: Point }) | null = null;
    let placeholderEdge: SVGElement;
    let flowNodeElements: FlowNode[] = [];
    let drawNodeHandles = true;
    let hoveredFlowNode: FlowNode | null;

    board.mousedown = event => {
        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        const selectElements = getSelectedElements(board);
        if (hoveredFlowNode) {
            sourceFlowNodeHandle = getHitHandleByNode(hoveredFlowNode, point);
            selectElements.map(item => {
                removeSelectedElement(board, item);
            });
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
                            nodeId: sourceFlowNodeHandle.node.id,
                            position: sourceFlowNodeHandle.position
                        },
                        target: {
                            nodeId: targetFlowNodeHandle.node.id,
                            position: targetFlowNodeHandle.position,
                            marker: 'arrow'
                        }
                    });
                }
            }
            return;
        } else {
            if (isEdgeDragging(board)) {
                return;
            }
            // 鼠标移入 flowNode 展示 handles
            const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            const newHitNode = getHitNode(board, point);
            if (hoveredFlowNode) {
                const isHitHoveredNodeHandle = !!getHitHandleByNode(hoveredFlowNode, point);
                if (newHitNode == hoveredFlowNode || isHitHoveredNodeHandle) {
                    return;
                }
                const isSelectedHoveredNode = isSelectedElement(board, hoveredFlowNode);
                if (!isSelectedHoveredNode) {
                    // destroy handles
                    const flowNodeComponent = PlaitElement.getComponent(hoveredFlowNode) as FlowNodeComponent;
                    flowNodeComponent?.destroyHandles();
                }
            }

            hoveredFlowNode = newHitNode;
            if (hoveredFlowNode) {
                // draw handles
                const flowNodeComponent = PlaitElement.getComponent(hoveredFlowNode) as FlowNodeComponent;
                flowNodeComponent?.drawHandles(hoveredFlowNode);
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
