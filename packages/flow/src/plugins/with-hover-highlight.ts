import { PlaitBoard, PlaitElement, PlaitPlugin, getMovingElements, toPoint, transformPoint } from '@plait/core';
import { FlowNode } from '../interfaces/node';
import { FlowEdge } from '../interfaces/edge';
import { getEdgesByNodeId, getHitEdge, getHitNode, isEdgeDragging, isPlaceholderEdgeInfo, getHitHandleByNode } from '../utils';
import { FlowNodeComponent } from '../flow-node.component';
import { FlowRenderMode } from '../interfaces/flow';
import { FlowEdgeComponent } from '../flow-edge.component';

export const withHoverHighlight: PlaitPlugin = (board: PlaitBoard) => {
    const { mousemove, mouseleave } = board;

    let hoveredElement: FlowNode | FlowEdge | null;
    let relationEdges: FlowEdge[] | null;

    board.mousemove = (event: MouseEvent) => {
        mousemove(event);
        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        const newHitNode = getHitNode(board, point) || getHitEdge(board, point);
        const movingNodes = getMovingElements(board);

        // 当移动节点、更改箭头方位、拖拽连线不执行
        if (movingNodes?.length || isEdgeDragging(board) || isPlaceholderEdgeInfo(board) || newHitNode?.id === hoveredElement?.id) {
            hoveredElement = newHitNode;
            return;
        }
        if (hoveredElement) {
            const hoveredComponent = PlaitElement.getComponent(hoveredElement);
            if (FlowNode.isFlowNodeElement(hoveredElement)) {
                (hoveredComponent as FlowNodeComponent)?.drawElement(hoveredElement, FlowRenderMode.default);
                (relationEdges || []).forEach(item => {
                    const component = PlaitElement.getComponent(item) as FlowEdgeComponent;
                    component && component.drawElement(item, FlowRenderMode.default);
                });
            } else {
                (hoveredComponent as FlowEdgeComponent)?.drawElement(hoveredElement, FlowRenderMode.default);
            }
        }
        hoveredElement = newHitNode;
        if (hoveredElement) {
            const hoveredComponent = PlaitElement.getComponent(hoveredElement);
            if (FlowNode.isFlowNodeElement(hoveredElement)) {
                (hoveredComponent as FlowNodeComponent)?.drawElement(hoveredElement, FlowRenderMode.hover);
                relationEdges = getEdgesByNodeId(board, hoveredElement.id);
                (relationEdges || []).forEach(item => {
                    const component = PlaitElement.getComponent(item) as FlowEdgeComponent;
                    component && component.drawElement(item, FlowRenderMode.hover);
                });
            } else {
                (hoveredComponent as FlowEdgeComponent)?.drawElement(hoveredElement, FlowRenderMode.hover);
            }
        }
    };

    board.mouseleave = (event: MouseEvent) => {
        hoveredElement = null;
        relationEdges = null;
        mouseleave(event);
    };

    return board;
};
