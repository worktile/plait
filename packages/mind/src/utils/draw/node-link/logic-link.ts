import { pointsOnBezierCurves } from 'points-on-curve';
import { MindNode } from '../../../interfaces/node';
import { Direction, PlaitBoard, Point, drawLinearPath, setStrokeLinecap } from '@plait/core';
import { getRectangleByNode, getShapeByElement, getStrokeStyleByElement } from '../..';
import { getLayoutDirection, getPointByPlacement, transformPlacement } from '../../point-placement';
import { HorizontalPlacement, PointPlacement, VerticalPlacement } from '../../../interfaces/types';
import { getBranchColorByMindElement, getBranchShapeByMindElement, getBranchWidthByMindElement } from '../../node-style/branch';
import { BranchShape, MindElementShape } from '../../../interfaces/element';
import { getStrokeLineDash, moveXOfPoint, StrokeStyle } from '@plait/common';

export function drawLogicLink(
    board: PlaitBoard,
    parent: MindNode,
    node: MindNode,
    isHorizontal: boolean,
    defaultStrokeColor: string | null = null,
    defaultStrokeWidth?: number,
    defaultStrokeStyle?: StrokeStyle
) {
    const branchShape = getBranchShapeByMindElement(board, parent.origin);
    const branchColor = defaultStrokeColor || getBranchColorByMindElement(board, node.origin);
    const branchWidth = defaultStrokeWidth || getBranchWidthByMindElement(board, node.origin);
    const strokeStyle = defaultStrokeStyle || getStrokeStyleByElement(board, node.origin);
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

    // ② Determine the convex straight line
    const straightLineDistance = 8;
    const beginPoint2 = hasStraightLine
        ? moveXOfPoint(beginPoint, straightLineDistance, linkDirection as unknown as Direction)
        : beginPoint;
    let straightLine: Point[] = hasStraightLine ? [beginPoint, beginPoint2, beginPoint2] : [];

    // ③ Determine the curve
    const beginBufferDistance = (parent.hGap + node.hGap) / 3;
    const endBufferDistance = -(parent.hGap + node.hGap) / 2.4;
    let curve: Point[] = [
        beginPoint2,
        moveXOfPoint(beginPoint2, beginBufferDistance, linkDirection as unknown as Direction),
        moveXOfPoint(endPoint, endBufferDistance, linkDirection as unknown as Direction),
        endPoint
    ];

    // ④ underline shape and horizontal
    const underlineEnd = moveXOfPoint(endPoint, nodeClient.width, linkDirection as unknown as Direction);
    const underline: Point[] = hasUnderlineShape && isHorizontal ? [underlineEnd, underlineEnd, underlineEnd] : [];
    const points = pointsOnBezierCurves([...straightLine, ...curve, ...underline]);
    const strokeLineDash = getStrokeLineDash(strokeStyle, branchWidth);
    let linkG: SVGGElement;
    if (branchShape === BranchShape.polyline) {
        const buffer = 8;
        const movePoint = moveXOfPoint(beginPoint2, buffer, linkDirection as unknown as Direction);
        const polylinePoints = [
            ...straightLine,
            movePoint,
            isHorizontal ? [movePoint[0], endPoint[1]] : [endPoint[0], movePoint[1]],
            endPoint,
            ...underline
        ];
        linkG = drawLinearPath(polylinePoints as Point[], { stroke: branchColor, strokeWidth: branchWidth, strokeLineDash });
    } else {
        linkG = PlaitBoard.getRoughSVG(board).curve(points as any, { stroke: branchColor, strokeWidth: branchWidth, strokeLineDash });
    }
    if (strokeStyle === StrokeStyle.dotted) {
        setStrokeLinecap(linkG, 'round');
    }
    return linkG;
}
