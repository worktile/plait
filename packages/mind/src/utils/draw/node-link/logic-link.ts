import { pointsOnBezierCurves } from 'points-on-curve';
import { MindNode } from '../../../interfaces/node';
import { PlaitBoard, Point, drawLinearPath } from '@plait/core';
import { getRectangleByNode, getShapeByElement } from '../..';
import { getLayoutDirection, getPointByPlacement, moveXOfPoint, transformPlacement } from '../../point-placement';
import { HorizontalPlacement, PointPlacement, VerticalPlacement } from '../../../interfaces/types';
import { getBranchColorByMindElement, getBranchShapeByMindElement, getBranchWidthByMindElement } from '../../node-style/branch';
import { BranchShape, MindElementShape } from '../../../interfaces/element';

export function drawLogicLink(
    board: PlaitBoard,
    parent: MindNode,
    node: MindNode,
    isHorizontal: boolean,
    defaultStroke: string | null = null,
    defaultStrokeWidth?: number
) {
    const branchShape = getBranchShapeByMindElement(board, parent.origin);
    const branchColor = defaultStroke || parent.origin?.branchColor || getBranchColorByMindElement(board, node.origin);
    const branchWidth = defaultStrokeWidth || getBranchWidthByMindElement(board, parent.origin);
    const hasStraightLine = branchShape === BranchShape.polyline ? true : !parent.origin.isRoot;
    const parentShape = getShapeByElement(board, parent.origin);
    const shape = getShapeByElement(board, node.origin);
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

    if (branchShape === BranchShape.polyline) {
        const buffer = 8;
        const movePoint = moveXOfPoint(beginPoint2, buffer, linkDirection);
        const polylinePoints = [
            ...straightLine,
            movePoint,
            isHorizontal ? [movePoint[0], endPoint[1]] : [endPoint[0], movePoint[1]],
            endPoint,
            ...underline
        ];
        return drawLinearPath(polylinePoints as Point[], { stroke: branchColor, strokeWidth: branchWidth });
    }
    return PlaitBoard.getRoughSVG(board).curve(points as any, { stroke: branchColor, strokeWidth: branchWidth });
}
