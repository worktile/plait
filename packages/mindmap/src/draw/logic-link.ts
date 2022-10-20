import { pointsOnBezierCurves } from 'points-on-curve';
import { RoughSVG } from 'roughjs/bin/svg';
import { MindmapNodeShape, STROKE_WIDTH } from '../constants';
import { MindmapNode } from '../interfaces/node';
import { getLinkLineColorByMindmapElement } from '../utils/colors';
import { Point } from '@plait/core';
import { getRectangleByNode } from '../utils';
import { getLinkDirection, getPointByPlacement, movePoint, transformPlacement } from '../utils/point-placement';
import { HorizontalPlacement, PointPlacement, VerticalPlacement } from '../interfaces/types';

export function drawLogicLink(roughSVG: RoughSVG, node: MindmapNode, parent: MindmapNode, isHorizontal: boolean) {
    const stroke = getLinkLineColorByMindmapElement(node.origin);
    const strokeWidth = node.origin.linkLineWidth ? node.origin.linkLineWidth : STROKE_WIDTH;
    const hasStraightLine = !parent.origin.isRoot;
    const hasUnderlineShape = node.origin.shape === MindmapNodeShape.underline;
    const hasUnderlineShapeOfParent = parent.origin.shape === MindmapNodeShape.underline;
    const nodeClient = getRectangleByNode(node);
    const parentClient = getRectangleByNode(parent);
    const linkDirection = getLinkDirection(node, isHorizontal);

    // ① 确定起始点
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
    const beginPoint2 = hasStraightLine ? movePoint(beginPoint, straightLineDistance, linkDirection) : beginPoint;
    let straightLine: Point[] = hasStraightLine ? [beginPoint, beginPoint2, beginPoint2] : [];

    // ③ 确定曲线
    const beginBufferDistance = (parent.hGap + node.hGap) / 3;
    const endBufferDistance = -(parent.hGap + node.hGap) / 2.4;
    let curve: Point[] = [
        beginPoint2,
        movePoint(beginPoint2, beginBufferDistance, linkDirection),
        movePoint(endPoint, endBufferDistance, linkDirection),
        endPoint
    ];

    // ④ 下划线绘制，underline shape and horizontal
    const underlineEnd = movePoint(endPoint, nodeClient.width, linkDirection);
    const underline: Point[] = hasUnderlineShape && isHorizontal ? [underlineEnd, underlineEnd, underlineEnd] : [];

    const points = pointsOnBezierCurves([...straightLine, ...curve, ...underline]);
    return roughSVG.curve(points as any, { stroke, strokeWidth });
}
