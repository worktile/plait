import { PlaitBoard, drawRoundRectangle, RectangleClient, drawArrow } from '@plait/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { getEdgePoints, getEdgeStyle } from '../utils/edge/edge';
import { FlowEdge, FlowEdgeHandleType } from '../interfaces/edge';

export const drawEdge = (
    board: PlaitBoard,
    roughSVG: RoughSVG,
    edge: FlowEdge,
    active = false,
    offsetX = 0,
    offsetY = 0,
    edgeHandle?: FlowEdgeHandleType | null
) => {
    const [pathPoints] = getEdgePoints(board, edge, offsetX, offsetY, edgeHandle);
    const edgeStyles = getEdgeStyle(edge, active);
    return roughSVG.linearPath(
        pathPoints.map(item => [item.x, item.y]),
        edgeStyles
    );
};

export const drawRichtextBackground = (roughSVG: RoughSVG, edge: FlowEdge, textBackgroundRect: RectangleClient, active = false) => {
    const edgeStyles = getEdgeStyle(edge, active);
    const { x, y, width, height } = textBackgroundRect;
    return drawRoundRectangle(roughSVG, x, y, x + width, y + height, edgeStyles, false, height / 2);
};

export const drawEdgeMarkers = (
    board: PlaitBoard,
    roughSVG: RoughSVG,
    edge: FlowEdge,
    active = false,
    offsetX = 0,
    offsetY = 0,
    edgeHandle?: FlowEdgeHandleType | null
) => {
    const [pathPoints] = getEdgePoints(board, edge, offsetX, offsetY, edgeHandle);
    const edgeStyles = getEdgeStyle(edge, active);
    const edgeMarkers: SVGGElement[] = [];
    if (edge.target.marker || edge.source?.marker) {
        let [start, end] = pathPoints.splice(-2);
        const targetMarker = drawArrow(roughSVG, [start.x, start.y], [end.x, end.y], edgeStyles);
        edgeMarkers.push(...targetMarker);
    }
    if (edge.source?.marker) {
        let [end, start] = pathPoints.splice(0, 2);
        const sourceMarker = drawArrow(roughSVG, [start.x, start.y], [end.x, end.y], edgeStyles);
        edgeMarkers.push(...sourceMarker);
    }
    return edgeMarkers;
};
