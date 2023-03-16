import { BOARD_TO_HOST, PlaitBoard, drawRoundRectangle } from '@plait/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { FlowEdge } from '../interfaces/edge';
import { FlowElementStyles } from '../interfaces/element';
import { getBend } from '../utils/edge/get-smooth-step-edge';
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
    return roughSVG.linearPath(
        pathPoints.map(item => [item.x, item.y]),
        edgeStyles
    );
};
