import { FlowElementStyles } from '../../interfaces/element';
import { Direction, PlaitBoard, PlaitElement, Point, RectangleClient, normalizePoint } from '@plait/core';
import { getElbowPoints } from './get-elbow-points';
import { getFakeFlowNodeById, getFlowNodeById } from '../node/get-node';
import { FlowEdge, FlowEdgeShape } from '../../interfaces/edge';
import { DEFAULT_EDGE_ACTIVE_STYLES, DEFAULT_EDGE_HOVER_STYLES, DEFAULT_EDGE_STYLES } from '../../constants/edge';
import { FlowNode } from '../../interfaces/node';
import { getEdgeDraggingInfo } from './dragging-edge';
import { FlowRenderMode } from '../../interfaces/flow';
import { FlowEdgeComponent } from '../../flow-edge.component';
import { getCurvePoints } from './get-curve-points';
import { getStraightPoints } from './get-straight-points';
import { getHandleXYPosition } from '../handle/get-handle-position';

interface GetPointsParams {
    sourceRectangle: RectangleClient;
    sourceDirection: Direction;
    sourcePoint: Point;
    targetRectangle: RectangleClient;
    targetDirection: Direction;
    targetPoint: Point;
}

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

export function getShapePoints(shape: FlowEdgeShape = FlowEdgeShape.elbow, params: GetPointsParams): Point[] {
    switch (shape) {
        case FlowEdgeShape.straight: {
            return getStraightPoints({
                sourcePoint: params.sourcePoint,
                targetPoint: params.targetPoint
            });
        }
        case FlowEdgeShape.curve: {
            return getCurvePoints({
                sourceDirection: params.sourceDirection,
                sourcePoint: params.sourcePoint,
                targetDirection: params.targetDirection,
                targetPoint: params.targetPoint
            });
        }
        default: {
            return getElbowPoints(params);
        }
    }
}

export const buildEdgePathPoints = (board: PlaitBoard, edge: FlowEdge) => {
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

    const { position: sourceDirection } = edge.source!;
    const { position: targetDirection } = edge.target;

    const sourceRectangle = {
        x: sourceNodeX,
        y: sourceNodeY,
        width: sourceNodeWidth,
        height: sourceNodeHeight
    };
    const targetRectangle = {
        x: targetNodeX,
        y: targetNodeY,
        width: targetNodeWidth,
        height: targetNodeHeight
    };
    let sourceHandle, targetHandle;
    if (edge.source?.handleId) {
        sourceHandle = sourceNode.handles?.find(item => item.handleId === edge.source?.handleId);
    }
    if (edge.target?.handleId) {
        targetHandle = targetNode.handles?.find(item => item.handleId === edge.target?.handleId);
    }
    const sourcePosition = getHandleXYPosition(sourceDirection, sourceRectangle, sourceHandle);
    const targetPosition = getHandleXYPosition(targetDirection, targetRectangle, targetHandle);
    const sourcePoint: Point = [sourcePosition.x, sourcePosition.y];
    const targetPoint: Point = [targetPosition.x, targetPosition.y];

    const params: GetPointsParams = {
        sourceRectangle,
        sourceDirection,
        sourcePoint,
        targetRectangle,
        targetDirection,
        targetPoint
    };
    const points = getShapePoints(edge.shape, params);
    return points.map(item => {
        return {
            x: item[0],
            y: item[1]
        };
    });
};

export const getEdgePoints = (board: PlaitBoard, edge: FlowEdge) => {
    const component = PlaitElement.getComponent(edge) as FlowEdgeComponent;
    return component?.pathPoints ? [...component?.pathPoints] : buildEdgePathPoints(board, edge);
};

export const getEdgeStyle = (edge: FlowEdge, mode: FlowRenderMode = FlowRenderMode.default) => {
    const edgeStyles: FlowElementStyles = {
        ...DEFAULT_EDGE_STYLES,
        ...(edge.styles || {}),
        stroke:
            mode === FlowRenderMode.active
                ? edge.styles?.activeStroke || DEFAULT_EDGE_ACTIVE_STYLES.stroke
                : mode === FlowRenderMode.hover
                ? edge.styles?.hoverStroke || DEFAULT_EDGE_HOVER_STYLES.stroke
                : edge.styles?.stroke || DEFAULT_EDGE_STYLES.stroke
    };
    return edgeStyles;
};
