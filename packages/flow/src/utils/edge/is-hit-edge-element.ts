import { RectangleClient, distanceBetweenPointAndRectangle, distanceBetweenPointAndSegment } from '@plait/core';
import { PlaitBoard } from '@plait/core';
import { FlowEdge } from '../../interfaces/edge';
import { HIT_THERSHOLD } from '../../constants/edge';
import { getEdgePoints } from './edge';
import { getEdgeTextBackgroundRect, getEdgeTextRect } from './text';

/**
 * isHitFlowEdge
 * @param element FlowEdge
 * @param board PlaitBoard
 * @returns boolean
 */
export function isHitFlowEdge(edge: FlowEdge, board: PlaitBoard) {
    const [pathPoints] = getEdgePoints(board, edge);
    let minDistance = Number.MAX_VALUE;
    if (board.selection) {
        const clickReact = RectangleClient.toRectangleClient([board.selection.anchor, board.selection.focus]);
        pathPoints.map((path, index) => {
            if (index < pathPoints.length - 1) {
                const nextPath = pathPoints[index + 1];
                if (!(nextPath.x === path.x && nextPath.y === path.y)) {
                    let distance = distanceBetweenPointAndSegment(clickReact.x, clickReact.y, path.x, path.y, nextPath.x, nextPath.y);
                    if (distance < minDistance) {
                        minDistance = distance;
                    }
                }
            }
        });
        const hitFlowEdgeText = isHitFlowEdgeText(edge, board, clickReact);
        const hitFlowEdge = minDistance < HIT_THERSHOLD;
        return hitFlowEdge || hitFlowEdgeText;
    }
    return false;
}

export function isHitFlowEdgeText(edge: FlowEdge, board: PlaitBoard, clickReact: RectangleClient) {
    const textRect = getEdgeTextRect(board, edge);
    const textBackgroundRect = getEdgeTextBackgroundRect(textRect);
    const distance = distanceBetweenPointAndRectangle(clickReact.x, clickReact.y, textBackgroundRect);
    return distance === 0;
}
