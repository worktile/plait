import { PlaitBoard, PlaitPlugin, toPoint, transformPoint, drawLine, idCreator, throttleRAF, drawCircle } from '@plait/core';
import { FlowNode } from '../interfaces/node';
import { FlowElementType } from '../interfaces/element';
import { isEdgeDragging } from '../utils/edge/dragging-edge';
import { destroyAllNodesHandle, drawAllNodesHandle } from '../utils/node/render-all-nodes-handle';
import { addCreateEdgeInfo, deleteCreateEdgeInfo } from '../utils/edge/create-edge';
import { DEFAULT_PLACEHOLDER_EDGE_STYLES } from '../constants/edge';
import { getHitHandleByNode, HitNodeHandle } from '../utils/handle/node';
import { getHitNode } from '../utils/node/get-hit-node';
import { DEFAULT_HANDLE_STYLES, HANDLE_DIAMETER } from '../constants/handle';
import { getHoverHandleInfo } from '../utils/handle/hover-handle';
import { addPlaceholderEdgeInfo, deletePlaceholderEdgeInfo } from '../utils/edge/placeholder-edge';

export const withEdgeCreate: PlaitPlugin = (board: PlaitBoard) => {
    const { mousedown, globalMousemove, globalMouseup } = board;

    let sourceFlowNodeHandle: HitNodeHandle | null = null;
    let targetFlowNodeHandle: HitNodeHandle | null = null;
    let placeholderEdge: SVGElement;
    let flowNodeElements: FlowNode[] = [];
    let drawNodeHandles = true;
    let hoveredNode: FlowNode | null;

    board.mousedown = event => {
        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        if (hoveredNode) {
            sourceFlowNodeHandle = getHitHandleByNode(hoveredNode, point);
        }
        mousedown(event);
    };

    board.globalMousemove = (event: MouseEvent) => {
        if (!board.options.readonly) {
            if (sourceFlowNodeHandle) {
                event.preventDefault();
                const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
                placeholderEdge?.remove();
                throttleRAF(() => {
                    if (sourceFlowNodeHandle) {
                        placeholderEdge = drawLine(
                            PlaitBoard.getRoughSVG(board),
                            sourceFlowNodeHandle.handlePoint,
                            point,
                            DEFAULT_PLACEHOLDER_EDGE_STYLES
                        );
                        const circleElement = drawCircle(PlaitBoard.getRoughSVG(board), point, HANDLE_DIAMETER, DEFAULT_HANDLE_STYLES);
                        circleElement?.setAttribute('stroke-linecap', 'round');
                        placeholderEdge.append(circleElement);
                        addPlaceholderEdgeInfo(board, placeholderEdge);
                    }
                    PlaitBoard.getHost(board).append(placeholderEdge);
                    if (drawNodeHandles) {
                        drawNodeHandles = false;
                        flowNodeElements = drawAllNodesHandle(board);
                    }
                    if (placeholderEdge) {
                        targetFlowNodeHandle = null;
                        targetFlowNodeHandle = getHoverHandleInfo(board) as HitNodeHandle;
                        if (
                            targetFlowNodeHandle &&
                            sourceFlowNodeHandle &&
                            targetFlowNodeHandle.handlePoint?.toString() !== sourceFlowNodeHandle.handlePoint.toString()
                        ) {
                            addCreateEdgeInfo(board, {
                                id: idCreator(),
                                type: FlowElementType.edge,
                                source: {
                                    nodeId: sourceFlowNodeHandle!.node.id,
                                    position: sourceFlowNodeHandle!.position
                                },
                                target: {
                                    nodeId: targetFlowNodeHandle.node.id,
                                    position: targetFlowNodeHandle.position,
                                    marker: 'arrow'
                                }
                            });
                        }
                    }
                });
                return;
            } else {
                if (isEdgeDragging(board)) {
                    return;
                }
                // 鼠标移入 flowNode 展示 handles
                const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
                const newHitNode = getHitNode(board, point);
                if (hoveredNode) {
                    const isHitHoveredNodeHandle = !!getHitHandleByNode(hoveredNode, point);
                    if (newHitNode == hoveredNode || isHitHoveredNodeHandle) {
                        return;
                    }
                }
                hoveredNode = newHitNode;
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
            deletePlaceholderEdgeInfo(board);
            deleteCreateEdgeInfo(board);
            drawNodeHandles = true;
            destroyAllNodesHandle(board, flowNodeElements);
            flowNodeElements = [];
            hoveredNode = null;
        }
    };

    return board;
};
