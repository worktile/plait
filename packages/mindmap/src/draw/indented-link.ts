import { pointsOnBezierCurves } from 'points-on-curve';
import { RoughSVG } from 'roughjs/bin/svg';
import { MindmapNodeShape, STROKE_WIDTH } from '../constants';
import { MindmapElement } from '../interfaces';
import { MindmapNode } from '../interfaces/node';
import { getLinkLineColorByMindmapElement } from '../utils/colors';
import { Point } from '@plait/core';
import { getNodeShapeByElement, getRectangleByNode, isChildRight, isChildUp } from '../utils';

export function drawIndentedLink(roughSVG: RoughSVG, node: MindmapNode, child: MindmapNode, defaultStroke: string | null = null) {
    const hasUnderline = (getNodeShapeByElement(child.origin) as MindmapNodeShape) === MindmapNodeShape.underline;
    let beginX,
        beginY,
        endX,
        endY,
        beginNode = node,
        endNode = child;
    const beginRectangle = getRectangleByNode(beginNode);
    const endRectangle = getRectangleByNode(endNode);

    beginX = Math.round(beginNode.x + beginNode.width / 2);
    beginY = isChildUp(node, child) ? Math.round(beginRectangle.y) : Math.round(beginRectangle.y + beginRectangle.height);
    endX = node.left ? Math.round(endNode.x + endNode.hGap + endRectangle.width) : Math.round(endNode.x + endNode.hGap);
    endY = hasUnderline ? Math.round(endNode.y + endNode.height - endNode.vGap) : Math.round(endNode.y + endNode.height / 2);
    //根据位置，设置正负参数
    let plusMinus = isChildUp(node, child) ? (node.left ? [-1, -1] : [1, -1]) : node.left ? [-1, 1] : [1, 1];

    let curve: Point[] = [
        [beginX, beginY],
        [beginX, beginY],
        [beginX, beginY],
        [beginX, Math.round(endY - (endNode.hGap * 3 * plusMinus[1]) / 5)],
        [beginX, Math.round(endY - (endNode.hGap * plusMinus[1]) / 5)],
        [Math.round(beginX + (endNode.hGap * plusMinus[0]) / 4), endY],
        [Math.round(beginX + (endNode.hGap * plusMinus[0] * 3) / 5), endY],
        hasUnderline ? [endX + (endNode.width - endNode.hGap * 2) * plusMinus[0], endY] : [endX, endY],
        hasUnderline ? [endX + (endNode.width - endNode.hGap * 2) * plusMinus[0], endY] : [endX, endY],
        hasUnderline ? [endX + (endNode.width - endNode.hGap * 2) * plusMinus[0], endY] : [endX, endY]
    ];

    const stroke = defaultStroke || getLinkLineColorByMindmapElement(child.origin);
    const strokeWidth = child.origin.linkLineWidth ? child.origin.linkLineWidth : STROKE_WIDTH;

    const points = pointsOnBezierCurves(curve);
    return roughSVG.curve(points as any, { stroke, strokeWidth });
}
