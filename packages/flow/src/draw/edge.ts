import { PlaitBoard, drawRoundRectangle, RectangleClient, drawArrow } from '@plait/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { getEdgePoints, getEdgeStyle } from '../utils/edge/edge';
import { FlowEdge } from '../interfaces/edge';
import { FlowRenderMode } from '../public-api';

export const drawEdge = (board: PlaitBoard, roughSVG: RoughSVG, edge: FlowEdge, edgeRenderMode: FlowRenderMode) => {
    const [pathPoints] = getEdgePoints(board, edge);
    const edgeStyles = getEdgeStyle(edge, edgeRenderMode);
    return roughSVG.linearPath(
        pathPoints.map(item => [item.x, item.y]),
        edgeStyles
    );
};

export const drawEdgeLabel = (roughSVG: RoughSVG, edge: FlowEdge, textBackgroundRect: RectangleClient, edgeRenderMode: FlowRenderMode) => {
    const edgeStyles = getEdgeStyle(edge, edgeRenderMode);
    const { x, y, width, height } = textBackgroundRect;
    return drawRoundRectangle(roughSVG, x, y, x + width, y + height, edgeStyles, false, Math.min(width, height) / 2);
};

export const drawEdgeMarkers = (board: PlaitBoard, roughSVG: RoughSVG, edge: FlowEdge, edgeRenderMode: FlowRenderMode) => {
    const [pathPoints] = getEdgePoints(board, edge);
    const edgeStyles = getEdgeStyle(edge, edgeRenderMode);
    const edgeMarkers: SVGGElement[] = [];
    if (edge.target.marker) {
        const [start, end] = pathPoints.splice(-2);
        const targetMarker = drawArrow(roughSVG, [start.x, start.y], [end.x, end.y], edgeStyles);
        edgeMarkers.push(...targetMarker);
    }
    if (edge.source?.marker) {
        const [end, start] = pathPoints.splice(0, 2);
        const sourceMarker = drawArrow(roughSVG, [start.x, start.y], [end.x, end.y], edgeStyles);
        edgeMarkers.push(...sourceMarker);
    }
    return edgeMarkers;
};
