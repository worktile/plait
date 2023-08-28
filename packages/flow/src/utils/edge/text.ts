import { FlowEdge } from '../../interfaces/edge';
import { PlaitBoard, XYPosition } from '@plait/core';
import { getEdgePoints } from './edge';
import { getLabelPoints } from './get-smooth-step-edge';

export function getEdgeTextXYPosition(board: PlaitBoard, edge: FlowEdge, width: number, height: number): XYPosition {
    const pathPoints = getEdgePoints(board, edge);
    const labelPoints = getLabelPoints([...pathPoints]);
    // TODO： 暂时取第一个点，接下来改判断多少重叠连线时在处理选择哪个等分点
    const x = labelPoints[0]?.x - width / 2;
    const y = labelPoints[0]?.y - height / 2;
    return {
        x,
        y
    };
}
