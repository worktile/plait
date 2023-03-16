import { PlaitBoard, drawRoundRectangle, RectangleClient, drawArrow } from '@plait/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { FlowEdge } from '../interfaces/edge';
import { getEdgePoints, getEdgeStyle } from '../utils/edge/edge';

/**
 * drawEdge
 * @param board PlaitBoard
 * @param roughSVG RoughSVG
 * @param edge FlowEdge
 * @param active boolaen
 * @returns
 */
export const drawEdge = (board: PlaitBoard, roughSVG: RoughSVG, edge: FlowEdge, active = false) => {
    const [pathPoints] = getEdgePoints(board, edge);
    const edgeStyles = getEdgeStyle(edge, active);
    return roughSVG.linearPath(
        pathPoints.map(item => [item.x, item.y]),
        edgeStyles
    );
};

/**
 * drawRichtextBackground
 * @param roughSVG RoughSVG
 * @param edge FlowEdge
 * @param textBackgroundRect RectangleClient
 * @param active boolean
 * @returns SVGGElement[]
 */
export const drawRichtextBackground = (roughSVG: RoughSVG, edge: FlowEdge, textBackgroundRect: RectangleClient, active = false) => {
    const edgeStyles = getEdgeStyle(edge, active);
    const { x, y, width, height } = textBackgroundRect;
    return drawRoundRectangle(roughSVG, x, y, x + width, y + height, edgeStyles, false, height / 2);
};

export const drawEdgeMarkers = (roughSVG: RoughSVG, board: PlaitBoard, edge: FlowEdge, active = false) => {
    const [pathPoints] = getEdgePoints(board, edge);
    const edgeStyles = getEdgeStyle(edge, active);
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
