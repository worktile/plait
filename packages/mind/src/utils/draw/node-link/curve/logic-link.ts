import { pointsOnBezierCurves } from 'points-on-curve';
import { MindNode } from '../../../../interfaces/node';
import { PlaitBoard, Point } from '@plait/core';
import { getRectangleByNode, getShapeByElement } from '../../..';
import { getLayoutDirection, getPointByPlacement, moveXOfPoint, transformPlacement } from '../../../point-placement';
import { HorizontalPlacement, PointPlacement, VerticalPlacement } from '../../../../interfaces/types';
import { getBranchColorByMindElement, getBranchWidthByMindElement } from '../../../node-style/branch';
import { MindElementShape } from '../../../../interfaces/element';

export function drawLogicLink(
    board: PlaitBoard,
    node: MindNode,
    parent: MindNode,
    isHorizontal: boolean,
    defaultStroke: string | null = null,
    defaultStrokeWidth?: number
) {
    const branchColor = defaultStroke || getBranchColorByMindElement(board, node.origin);
    const branchWidth = defaultStrokeWidth || getBranchWidthByMindElement(board, node.origin);
    const hasStraightLine = !parent.origin.isRoot;
    const parentShape = getShapeByElement(board, parent.origin);
    const shape = node.origin.shape ? node.origin.shape : parentShape;
    const hasUnderlineShape = shape === MindElementShape.underline;
    const hasUnderlineShapeOfParent = parentShape === MindElementShape.underline;
    const nodeClient = getRectangleByNode(node);
    const parentClient = getRectangleByNode(parent);
    const linkDirection = getLayoutDirection(node, isHorizontal);

    // ① ensure begin placement and end placement
    // begin placement represent parent connector position and end placement represent child connector
    const beginPlacement: PointPlacement = [HorizontalPlacement.right, VerticalPlacement.middle];
    const endPlacement: PointPlacement = [HorizontalPlacement.left, VerticalPlacement.middle];

    transformPlacement(beginPlacement, linkDirection);
    transformPlacement(endPlacement, linkDirection);

    // underline shape and horizontal
    if (isHorizontal && hasUnderlineShapeOfParent && !parent.origin.isRoot) {
        beginPlacement[1] = VerticalPlacement.bottom;
    }
    if (isHorizontal && hasUnderlineShape) {
        endPlacement[1] = VerticalPlacement.bottom;
    }

    let beginPoint = getPointByPlacement(parentClient, beginPlacement);
    let endPoint = getPointByPlacement(nodeClient, endPlacement);

    // ② 确定凸出直线，从起始点开始画一条直线，从直线的结束位置绘制曲线，保证收起图标可以完美覆盖起始连线，根节点不需要这条直线
    // 绘制贝塞尔曲线要求，需要增加三个点，正常两个点就可以确定这条直线
    const straightLineDistance = 8;
    const beginPoint2 = hasStraightLine ? moveXOfPoint(beginPoint, straightLineDistance, linkDirection) : beginPoint;
    let straightLine: Point[] = hasStraightLine ? [beginPoint, beginPoint2, beginPoint2] : [];

    // ③ 确定曲线
    const beginBufferDistance = (parent.hGap + node.hGap) / 3;
    const endBufferDistance = -(parent.hGap + node.hGap) / 2.4;
    let curve: Point[] = [
        beginPoint2,
        moveXOfPoint(beginPoint2, beginBufferDistance, linkDirection),
        moveXOfPoint(endPoint, endBufferDistance, linkDirection),
        endPoint
    ];

    // ④ 下划线绘制，underline shape and horizontal
    const underlineEnd = moveXOfPoint(endPoint, nodeClient.width, linkDirection);
    const underline: Point[] = hasUnderlineShape && isHorizontal ? [underlineEnd, underlineEnd, underlineEnd] : [];

    const points = pointsOnBezierCurves([...straightLine, ...curve, ...underline]);
    return PlaitBoard.getRoughSVG(board).curve(points as any, { stroke: branchColor, strokeWidth: branchWidth });
}
