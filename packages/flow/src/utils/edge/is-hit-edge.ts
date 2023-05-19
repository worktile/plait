import { Point, distanceBetweenPointAndRectangle, distanceBetweenPointAndSegment, isSelectedElement } from '@plait/core';
import { PlaitBoard } from '@plait/core';
import { FlowEdge } from '../../interfaces/edge';
import { HIT_THRESHOLD } from '../../constants/edge';
import { getEdgePoints } from './edge';
import { getEdgeTextBackgroundRect, getEdgeTextRect } from './text';
import { isHitEdgeHandle } from '../handle/edge';

export function isHitEdge(board: PlaitBoard, edge: FlowEdge, point: Point) {
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

        const hitFlowEdgeText = isHitEdgeText(board, edge, point);
        const hitEdgeHandle = isHitEdgeHandle(board, edge, point);
        const isActiveEdge = isSelectedElement(board, edge);
        let hitFlowEdge = minDistance < HIT_THRESHOLD;
        if (!isActiveEdge && hitEdgeHandle) {
            hitFlowEdge = false;
        }
        return hitFlowEdge || hitFlowEdgeText;
    }
    return false;
}

export function isHitEdgeText(board: PlaitBoard, edge: FlowEdge, point: Point) {
    const textRect = getEdgeTextRect(board, edge);
    const textBackgroundRect = getEdgeTextBackgroundRect(textRect);
    const distance = distanceBetweenPointAndRectangle(point[0], point[1], textBackgroundRect);
    return distance === 0;
}
