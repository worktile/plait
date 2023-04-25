import { Point, distanceBetweenPointAndRectangle, distanceBetweenPointAndSegment } from '@plait/core';
import { PlaitBoard } from '@plait/core';
import { FlowEdge } from '../../interfaces/edge';
import { HIT_THRESHOLD } from '../../constants/edge';
import { getEdgePoints } from './edge';
import { getEdgeTextBackgroundRect, getEdgeTextRect } from './text';

export function isHitFlowEdge(board: PlaitBoard, edge: FlowEdge, point: Point) {
    const [pathPoints] = getEdgePoints(board, edge);
    let minDistance = Number.MAX_VALUE;
    if (board.selection) {
        pathPoints.map((path, index) => {
            if (index < pathPoints.length - 1) {
                const nextPath = pathPoints[index + 1];
                if (!(nextPath.x === path.x && nextPath.y === path.y)) {
                    let distance = distanceBetweenPointAndSegment(point[0], point[1], path.x, path.y, nextPath.x, nextPath.y);
                    if (distance < minDistance) {
                        minDistance = distance;
                    }
                }
            }
        });
        const hitFlowEdgeText = isHitFlowEdgeText(board, edge, point);
        const hitFlowEdge = minDistance < HIT_THRESHOLD;
        return hitFlowEdge || hitFlowEdgeText;
    }
    return false;
}

export function isHitFlowEdgeText(board: PlaitBoard, edge: FlowEdge, point: Point) {
    const textRect = getEdgeTextRect(board, edge);
    const textBackgroundRect = getEdgeTextBackgroundRect(textRect);
    const distance = distanceBetweenPointAndRectangle(point[0], point[1], textBackgroundRect);
    return distance === 0;
}
