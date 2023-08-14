import { FlowElementStyles, FlowHandle, FlowPosition } from '../../interfaces/element';
import { PlaitBoard, RectangleClient, normalizePoint } from '@plait/core';
import { getPoints } from './get-smooth-step-edge';
import { getFakeFlowNodeById, getFlowNodeById } from '../node/get-node';
import { FlowEdge } from '../../interfaces/edge';
import { DEFAULT_EDGE_ACTIVE_STYLES, DEFAULT_EDGE_HOVER_STYLES, DEFAULT_EDGE_STYLES } from '../../constants/edge';
import { FlowNode } from '../../interfaces/node';
import { getEdgeDraggingInfo } from './dragging-edge';
import { getEdgePosition } from './get-edge-position';
import { FlowRenderMode } from '../../public-api';

interface EdgePositions {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
}

export const getEdgePositions = (
    sourceNodeRect: RectangleClient,
    sourceHandle: FlowHandle,
    sourcePosition: FlowPosition,
    targetNodeRect: RectangleClient,
    targetHandle: FlowHandle,
    targetPosition: FlowPosition
): EdgePositions => {
    const edgeSourcePosition = getEdgePosition(sourcePosition, sourceNodeRect, sourceHandle);
    const edgeTargetPosition = getEdgePosition(targetPosition, targetNodeRect, targetHandle);

    return {
        sourceX: edgeSourcePosition.x,
        sourceY: edgeSourcePosition.y,
        targetX: edgeTargetPosition.x,
        targetY: edgeTargetPosition.y
    };
};

// this is used for straight edges and simple smoothstep edges (LTR, RTL, BTT, TTB)
export function getEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY
}: {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
}): [number, number, number, number] {
    const xOffset = Math.abs(targetX - sourceX) / 2;
    const centerX = targetX < sourceX ? targetX + xOffset : targetX - xOffset;

    const yOffset = Math.abs(targetY - sourceY) / 2;
    const centerY = targetY < sourceY ? targetY + yOffset : targetY - yOffset;

    return [centerX, centerY, xOffset, yOffset];
}

export const getEdgePoints = (board: PlaitBoard, edge: FlowEdge) => {
    let sourceNode: FlowNode, targetNode: FlowNode;
    const dragEdgeInfo = FlowEdge.isFlowEdgeElement(edge) && getEdgeDraggingInfo(edge);

    if (dragEdgeInfo && dragEdgeInfo.handleType === 'source') {
        sourceNode = getFakeFlowNodeById(board, edge.source?.nodeId!, dragEdgeInfo.offsetX, dragEdgeInfo.offsetY);
    } else {
        sourceNode = getFlowNodeById(board, edge.source?.nodeId!);
    }

    if (dragEdgeInfo && dragEdgeInfo.handleType === 'target') {
        targetNode = getFakeFlowNodeById(board, edge.target?.nodeId!, dragEdgeInfo.offsetX, dragEdgeInfo.offsetY);
    } else {
        targetNode = getFlowNodeById(board, edge.target?.nodeId!);
    }

    if (!sourceNode || !targetNode) {
        throw new Error(`unable to find sourceNode or targetNode by edge with id ${edge.nodeId}`);
    }

    let { x: sourceNodeX, y: sourceNodeY } = normalizePoint(sourceNode.points![0]);
    let { x: targetNodeX, y: targetNodeY } = normalizePoint(targetNode.points![0]);
    const { width: sourceNodeWidth, height: sourceNodeHeight } = sourceNode;
    const { width: targetNodeWidth, height: targetNodeHeight } = targetNode;

    const { position: sourcePosition } = edge.source!;
    const { position: targetPosition } = edge.target;

    const { sourceX, sourceY, targetX, targetY } = getEdgePositions(
        {
            x: sourceNodeX,
            y: sourceNodeY,
            width: sourceNodeWidth,
            height: sourceNodeHeight
        },
        edge.source!,
        sourcePosition,
        {
            x: targetNodeX,
            y: targetNodeY,
            width: targetNodeWidth,
            height: targetNodeHeight
        },
        edge.target,
        targetPosition
    );

    return getPoints({
        source: { x: sourceX, y: sourceY },
        sourcePosition,
        target: { x: targetX, y: targetY },
        targetPosition,
        center: { x: undefined, y: undefined },
        offset: 30
    });
};

export const getEdgeStyle = (edge: FlowEdge, edgeRenderMode: FlowRenderMode = FlowRenderMode.default) => {
    const edgeStyles: FlowElementStyles = {
        ...DEFAULT_EDGE_STYLES,
        ...(edge.styles || {}),
        stroke:
            edgeRenderMode === FlowRenderMode.active
                ? edge.styles?.activeStroke || DEFAULT_EDGE_ACTIVE_STYLES.stroke
                : edgeRenderMode === FlowRenderMode.hover
                ? edge.styles?.hoverStroke || DEFAULT_EDGE_HOVER_STYLES.stroke
                : DEFAULT_EDGE_STYLES.stroke
    };
    return edgeStyles;
};
