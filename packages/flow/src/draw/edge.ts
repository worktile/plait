import { PlaitBoard, drawRoundRectangle, RectangleClient, drawArrow } from '@plait/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { getEdgePoints, getEdgeStyle } from '../utils/edge/edge';
import { FlowEdge } from '../interfaces/edge';
import { FlowRenderMode } from '../interfaces/flow';
import { getExtendPoint } from '@plait/common';

export const drawEdgeRoute = (board: PlaitBoard, edge: FlowEdge, mode: FlowRenderMode) => {
    const roughSVG = PlaitBoard.getRoughSVG(board);
    const pathPoints = getEdgePoints(board, edge);
    const edgeStyles = getEdgeStyle(edge, mode);
    return roughSVG.linearPath(
        pathPoints.map(item => [item.x, item.y]),
        edgeStyles
    );
};

export const drawEdgeLabelShape = (board: PlaitBoard, edge: FlowEdge, textBackgroundRect: RectangleClient, mode: FlowRenderMode) => {
    const edgeStyles = getEdgeStyle(edge, mode);
    const { x, y, width, height } = textBackgroundRect;
    return drawRoundRectangle(PlaitBoard.getRoughSVG(board), x, y, x + width, y + height, edgeStyles, false, Math.min(width, height) / 2);
};

export const drawEdgeMarkers = (board: PlaitBoard, edge: FlowEdge, mode: FlowRenderMode) => {
    const roughSVG = PlaitBoard.getRoughSVG(board);
    const pathPoints = [...getEdgePoints(board, edge)];
    const edgeStyles = getEdgeStyle(edge, mode);
    const edgeMarkers: SVGGElement[] = [];
    if (edge.target.marker) {
        const [start, end] = pathPoints.splice(-2);
        const startPoint = getExtendPoint([end.x, end.y], [start.x, start.y], 20);
        const targetMarker = drawArrow(roughSVG, startPoint, [end.x, end.y], edgeStyles);
        edgeMarkers.push(...targetMarker);
    }
    if (edge.source?.marker) {
        const [end, start] = pathPoints.splice(0, 2);
        const startPoint = getExtendPoint([end.x, end.y], [start.x, start.y], 20);
        const sourceMarker = drawArrow(roughSVG, startPoint, [end.x, end.y], edgeStyles);
        edgeMarkers.push(...sourceMarker);
    }
    return edgeMarkers;
};
