import { RectangleClient, distanceBetweenPointAndSegment } from '@plait/core';
import { PlaitBoard } from '@plait/core';
import { FlowEdge } from '../../interfaces/edge';
import { HIT_THERSHOLD } from '../../constants/edge';
import { getEdgePoints } from './edge';

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
        return minDistance < HIT_THERSHOLD;
    }

    return false;
}
