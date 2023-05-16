import {
    BOARD_TO_HOST,
    ELEMENT_TO_COMPONENT,
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
import { isHitFlowNode } from '../utils/node/is-hit-node';
import { FlowElementType } from '../interfaces/element';
import { isEdgeDragging } from '../utils/edge/dragging-edge';
import { FlowEdgeHandle } from '../interfaces/edge';
import { getFlowElementsByType } from '../utils/node/get-node';
import { destroyAllNodesHandle, drawAllNodesHandle } from '../utils/node/render-all-nodes-handle';
import { getHitNodeHandle } from '../utils/handle/get-hit-node-handle';
import { addCreateEdgeInfo, deleteCreateEdgeInfo } from '../utils/edge/create-edge';
import { DEFAULT_PLACEHOLDER_ACTIVE_STYLES } from '../constants/edge';

export const withEdgeCreate: PlaitPlugin = (board: PlaitBoard) => {
    const { mousedown, globalMousemove, globalMouseup } = board;

    let sourceFlowNodeHandle: (FlowEdgeHandle & { handlePoint: Point }) | null = null;
    let targetFlowNodeHandle: (FlowEdgeHandle & { handlePoint: Point }) | null = null;
    let placeholderEdge: SVGElement;
    let flowNodeElements: FlowNode[] = [];
    let drawNodeHandles = true;

    board.mousedown = event => {
        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        const flowNodeHandle = getHitNodeHandle(board, point);
        if (flowNodeHandle) {
            let isRenderNodeHandle = false;
            const component = PlaitElement.getComponent(flowNodeHandle?.node) as FlowNodeComponent;
            if (component.handlesG) {
                isRenderNodeHandle = true;
            }
            if (isRenderNodeHandle) {
                sourceFlowNodeHandle = flowNodeHandle;
                const selectedElements = getSelectedElements(board);
                selectedElements.map(item => {
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
            const flowNodes = getFlowElementsByType(board, FlowElementType.node) as FlowNode[];
            flowNodes.forEach((value, index) => {
                const flowNodeComponent = ELEMENT_TO_COMPONENT.get(value) as FlowNodeComponent;
                const isSelected = isSelectedElement(board, value);
                if (!isSelected && !isEdgeDragging(board)) {
                    const hitFlowNode = isHitFlowNode(board, value, [point, point]);
                    if (hitFlowNode) {
                        flowNodeComponent.drawHandles(value);
                    } else if (!getHitNodeHandle(board, point)) {
                        flowNodeComponent.destroyHandles();
                    }
                }
            });
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
        }
    };

    return board;
};
