import {
    BOARD_TO_HOST,
    ELEMENT_TO_PLUGIN_COMPONENT,
    PlaitBoard,
    PlaitPlugin,
    Point,
    isSelectedElement,
    toPoint,
    transformPoint,
    drawLine,
    getSelectedElements,
    idCreator
} from '@plait/core';
import { FlowNode } from '../interfaces/node';
import { FlowNodeComponent } from '../flow-node.component';
import { isHitFlowNode } from '../utils/node/is-hit-node';
import { FlowElementType, FlowHandle } from '../interfaces/element';
import { isEdgeDragging } from '../utils/edge/dragging-edge';
import { getHitFlowNodeHandle } from '../utils/handle/get-hit-node-handle';
import { FlowEdge, FlowEdgeInfo } from '../interfaces/edge';
import { getFlowElementsByType } from '../utils/node/get-node-by-id';
import { drawAllNodesHandle } from '../utils/node/render-all-nodes-handle';
import { isHitFlowEdge } from '../utils/edge/is-hit-edge-element';
import { addCreateEdgeInfo, deleteCreateEdgeInfo } from '../utils/edge/create-edge';
import { DEFAULT_PLACEHOLDER_ACTIVE_STYLES } from '../constants/edge';

export const withEdgeCreate: PlaitPlugin = (board: PlaitBoard) => {
    const { mousedown, mousemove, mouseup } = board;

    let edgeSource: FlowEdgeInfo | null;
    let edgeTarget: FlowEdgeInfo | null;
    let hitFlowNodeHandle: (FlowHandle & { handlePoint: Point }) | null = null;
    let placeholderEdge: SVGElement;
    let flowNodeElements: FlowNode[] = [];

    board.mousedown = event => {
        const nodes = getFlowElementsByType(board, FlowElementType.node) as FlowNode[];
        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        const selectElements = getSelectedElements(board);
        let hitFlowEdgeHandle = false;
        if (selectElements.length && FlowEdge.isFlowEdgeElement(selectElements[0])) {
            // 如果点击到了已经存在的 edge 的 handle，执行 drag 逻辑而不是新增 edge
            hitFlowEdgeHandle = isHitFlowEdge(board, selectElements[0], point);
        }
        nodes.map(value => {
            if (!hitFlowNodeHandle && !hitFlowEdgeHandle) {
                hitFlowNodeHandle = getHitFlowNodeHandle(value, point);
                if (hitFlowNodeHandle) {
                    edgeSource = {
                        id: value.id,
                        position: hitFlowNodeHandle.position
                    };
                }
            }
        });
        if (edgeSource) {
            return;
        }
        mousedown(event);
    };

    board.mousemove = (event: MouseEvent) => {
        // 鼠标移入 flowNode 展示 handles
        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        const flowNodes = getFlowElementsByType(board, FlowElementType.node) as FlowNode[];
        flowNodes.forEach((value, index) => {
            const flowNodeComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(value) as FlowNodeComponent;
            const isSelected = isSelectedElement(board, value);
            if (!isSelected && !isEdgeDragging(board)) {
                const hitFlowNode = isHitFlowNode(board, value, [point, point]);
                if (hitFlowNode) {
                    flowNodeComponent.drawHandles(value);
                } else if (!getHitFlowNodeHandle(value, point)) {
                    flowNodeComponent.destroyHandles();
                }
            }
        });

        if (edgeSource && hitFlowNodeHandle) {
            const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            placeholderEdge?.remove();
            placeholderEdge = drawLine(
                PlaitBoard.getRoughSVG(board),
                hitFlowNodeHandle.handlePoint,
                point,
                DEFAULT_PLACEHOLDER_ACTIVE_STYLES
            );
            BOARD_TO_HOST.get(board)?.append(placeholderEdge);
            flowNodeElements = drawAllNodesHandle(board);
        }
        mousemove(event);
    };

    board.mouseup = (event: MouseEvent) => {
        if (placeholderEdge) {
            hitFlowNodeHandle = null;
            deleteCreateEdgeInfo(board);
            // 判断结束位置
            const nodes = getFlowElementsByType(board, FlowElementType.node) as FlowNode[];
            const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            nodes.map(value => {
                if (!hitFlowNodeHandle) {
                    hitFlowNodeHandle = getHitFlowNodeHandle(value, point);
                    if (hitFlowNodeHandle) {
                        edgeTarget = {
                            id: value.id,
                            position: hitFlowNodeHandle.position,
                            marker: 'arrow'
                        };
                    }
                }
            });
            if (edgeSource && edgeTarget) {
                addCreateEdgeInfo(board, {
                    id: idCreator(),
                    type: FlowElementType.edge,
                    source: edgeSource,
                    target: edgeTarget
                });
            }
            edgeSource = null;
            edgeTarget = null;
            flowNodeElements = [];
            placeholderEdge?.remove();
        }

        mouseup(event);
    };

    return board;
};
