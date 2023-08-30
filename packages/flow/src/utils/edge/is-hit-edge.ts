import { Point, XYPosition, distanceBetweenPointAndRectangle, distanceBetweenPointAndSegment, isSelectedElement } from '@plait/core';
import { PlaitBoard } from '@plait/core';
import { FlowEdge } from '../../interfaces/edge';
import { HIT_THRESHOLD } from '../../constants/edge';
import { isHitEdgeHandle } from '../handle/edge';
import { EdgeLabelSpace } from './label-space';
import { FlowBaseData } from '../../interfaces/element';
import { getEdgePoints } from './edge';

export function isHitEdge(board: PlaitBoard, edge: FlowEdge, point: Point) {
    const pathPoints = getEdgePoints(board, edge);
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

        const hitFlowEdgeText = (edge.data?.text?.children[0] as FlowBaseData)?.text && isHitEdgeText(board, edge, point, pathPoints);
        const hitEdgeHandle = isHitEdgeHandle(board, edge, point);
        const isActiveEdge = isSelectedElement(board, edge);
        let hitFlowEdge = minDistance < HIT_THRESHOLD;
        if (!isActiveEdge && hitEdgeHandle) {
            hitFlowEdge = false;
        }
        return hitFlowEdge || !!hitFlowEdgeText;
    }
    return false;
}

export function isHitEdgeText(board: PlaitBoard, edge: FlowEdge, point: Point, pathPoints: XYPosition[]) {
    const textRect = EdgeLabelSpace.getLabelTextRect(board, edge, pathPoints);
    const labelRect = EdgeLabelSpace.getLabelRect(textRect, edge);
    const distance = distanceBetweenPointAndRectangle(point[0], point[1], labelRect);
    return distance === 0;
}
