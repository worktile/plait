import { PlaitBoard, drawRoundRectangle, RectangleClient, drawArrow } from '@plait/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { getEdgePoints, getEdgeStyle } from '../utils/edge/edge';
import { FlowEdge, FlowEdgeTypeMode } from '../interfaces/edge';

export const drawEdge = (board: PlaitBoard, roughSVG: RoughSVG, edge: FlowEdge, edgeType: FlowEdgeTypeMode) => {
    const [pathPoints] = getEdgePoints(board, edge);
    const edgeStyles = getEdgeStyle(edge, edgeType);
    return roughSVG.linearPath(
        pathPoints.map(item => [item.x, item.y]),
        edgeStyles
    );
};

export const drawEdgeLabel = (roughSVG: RoughSVG, edge: FlowEdge, textBackgroundRect: RectangleClient, edgeType: FlowEdgeTypeMode) => {
    const edgeStyles = getEdgeStyle(edge, edgeType);
    const { x, y, width, height } = textBackgroundRect;
    return drawRoundRectangle(roughSVG, x, y, x + width, y + height, edgeStyles, false, Math.min(width, height) / 2);
};

export const drawEdgeMarkers = (board: PlaitBoard, roughSVG: RoughSVG, edge: FlowEdge, edgeType: FlowEdgeTypeMode) => {
    const [pathPoints] = getEdgePoints(board, edge);
    const edgeStyles = getEdgeStyle(edge, edgeType);
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
