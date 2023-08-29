import { FlowEdge } from '../../interfaces/edge';
import { PlaitBoard, XYPosition } from '@plait/core';
import { getEdgePoints } from './edge';
import { getLabelPoints } from './get-smooth-step-edge';
import { getSameLineEdges } from './get-same-line-edges';

export function getEdgeTextXYPosition(board: PlaitBoard, edge: FlowEdge, width: number, height: number): XYPosition {
    const pathPoints = getEdgePoints(board, edge);
    // 拆分获取 sameLineEdges 是因为当同一条线不同指向， 开始-->进行中 / 进行中-->开始，避免选值重叠
    const { sameDirectionEdges, sameLineEdges, count } = getSameLineEdges(board, edge);
    const labelPoints = getLabelPoints([...pathPoints].reverse(), count + 1);
    const index = [...sameLineEdges, ...sameDirectionEdges].findIndex(value => value.id === edge.id);
    const x = labelPoints[index]?.x - width / 2;
    const y = labelPoints[index]?.y - height / 2;
    return {
        x,
        y
    };
}
