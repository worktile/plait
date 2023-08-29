import { drawRoundRectangle, RectangleClient, drawArrow, XYPosition } from '@plait/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { getEdgeStyle } from '../utils/edge/edge';
import { FlowEdge } from '../interfaces/edge';
import { FlowRenderMode } from '../interfaces/flow';

export const drawEdge = (pathPoints: XYPosition[], roughSVG: RoughSVG, edge: FlowEdge, mode: FlowRenderMode) => {
    const edgeStyles = getEdgeStyle(edge, mode);
    return roughSVG.linearPath(
        pathPoints.map(item => [item.x, item.y]),
        edgeStyles
    );
};

export const drawEdgeLabel = (roughSVG: RoughSVG, edge: FlowEdge, textBackgroundRect: RectangleClient, mode: FlowRenderMode) => {
    const edgeStyles = getEdgeStyle(edge, mode);
    const { x, y, width, height } = textBackgroundRect;
    return drawRoundRectangle(roughSVG, x, y, x + width, y + height, edgeStyles, false, Math.min(width, height) / 2);
};

export const drawEdgeMarkers = (pathPoints: XYPosition[], roughSVG: RoughSVG, edge: FlowEdge, mode: FlowRenderMode) => {
    const edgeStyles = getEdgeStyle(edge, mode);
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
