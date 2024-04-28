import { PlaitBoard, drawRoundRectangle, RectangleClient, drawArrow } from '@plait/core';
import { getEdgePoints, getEdgeStyle } from '../utils/edge/edge';
import { FlowEdge } from '../interfaces/edge';
import { EdgeState } from '../interfaces/edge';
import { getExtendPoint } from '@plait/common';

export const drawEdgeRoute = (board: PlaitBoard, edge: FlowEdge, state: EdgeState) => {
    const roughSVG = PlaitBoard.getRoughSVG(board);
    const pathPoints = getEdgePoints(board, edge);
    const edgeStyles = getEdgeStyle(edge, state);
    return roughSVG.linearPath(
        pathPoints.map(item => [item.x, item.y]),
        edgeStyles
    );
};

export const drawEdgeLabelShape = (board: PlaitBoard, edge: FlowEdge, textBackgroundRect: RectangleClient, state: EdgeState) => {
    const edgeStyles = getEdgeStyle(edge, state);
    const { x, y, width, height } = textBackgroundRect;
    return drawRoundRectangle(PlaitBoard.getRoughSVG(board), x, y, x + width, y + height, edgeStyles, false, Math.min(width, height) / 2);
};

export const drawEdgeMarkers = (board: PlaitBoard, edge: FlowEdge, state: EdgeState) => {
    const roughSVG = PlaitBoard.getRoughSVG(board);
    const pathPoints = [...getEdgePoints(board, edge)];
    const edgeStyles = getEdgeStyle(edge, state);
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
