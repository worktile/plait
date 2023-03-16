import { PlaitBoard, drawRoundRectangle, RectangleClient } from '@plait/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { FlowEdge } from '../interfaces/edge';
import { FlowElementStyles } from '../interfaces/element';
import { getEdgePoints } from '../utils/edge/edge';
import { DEAFULT_EDGE_ACTIVE_STYLES, DEAFULT_EDGE_STYLES } from '../constants/edge';

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

export const drawRichtextBackground = (roughSVG: RoughSVG, edge: FlowEdge, textBackgroundRect: RectangleClient, active = false) => {
    const edgeStyles = getEdgeStyle(edge, active);
    const { x, y, width, height } = textBackgroundRect;
    return drawRoundRectangle(roughSVG, x, y, x + width, y + height, edgeStyles, false, height / 2);
};

export const getEdgeStyle = (edge: FlowEdge, active: boolean) => {
    let edgeStyles: FlowElementStyles = {
        ...DEAFULT_EDGE_STYLES,
        ...(edge.styles || {})
    };
    if (active) {
        edgeStyles = {
            ...edgeStyles,
            stroke: edge.styles?.activeStroke || DEAFULT_EDGE_ACTIVE_STYLES.stroke
        };
    }
    return edgeStyles;
};
