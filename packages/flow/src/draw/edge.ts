import { PlaitBoard } from '@plait/core';
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
    const [pathPoints, labelX, labelY] = getEdgePoints(board, edge);
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
    const path = pathPoints.reduce<string>((res, p, i) => {
        let segment = '';
        if (i > 0 && i < pathPoints.length - 1) {
            segment = getBend(pathPoints[i - 1], p, pathPoints[i + 1], 5);
        } else {
            segment = `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`;
        }
        res += segment;
        return res;
    }, '');

    return roughSVG.path(path, edgeStyles);
};
