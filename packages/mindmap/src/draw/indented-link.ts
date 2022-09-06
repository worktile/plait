import { pointsOnBezierCurves } from 'points-on-curve';
import { RoughSVG } from 'roughjs/bin/svg';
import { MindmapNodeShape, STROKE_WIDTH } from '../constants';
import { MindmapElement } from '../interfaces';
import { MindmapNode } from '../interfaces/node';
import { getLinkLineColorByMindmapElement } from '../utils/colors';
import { Point } from '@plait/core';
import { getNodeShapeByElement, getRectangleByNode } from '../utils';

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
    beginY = node.y < child.y ? Math.round(beginRectangle.y + beginRectangle.height) : Math.round(beginRectangle.y);
    endX = node.x < child.x ? Math.round(endNode.x + endNode.hGap) : Math.round(endNode.x + endNode.hGap + endRectangle.width);
    endY = hasUnderline ? Math.round(endNode.y + endNode.height - endNode.vGap) : Math.round(endNode.y + endNode.height / 2);
    //方位参数
    let plusMinus = node.y < child.y ? (node.x < child.x ? [1, 1] : [-1, 1]) : node.x < child.x ? [1, -1] : [-1, -1];

    let curve: Point[] = [
        [beginX, beginY],
        [beginX, endY - (endNode.hGap * 3 * plusMinus[1]) / 5],
        [beginX, endY - (endNode.hGap * 3 * plusMinus[1]) / 5],
        [beginX, endY - (endNode.hGap * 3 * plusMinus[1]) / 5],
        [beginX, endY - (endNode.hGap * plusMinus[1]) / 5],
        [beginX + (endNode.hGap * plusMinus[0]) / 4, endY],
        [endX - (endNode.vGap * plusMinus[0]) / 4, endY],
        [endX - (endNode.vGap * plusMinus[0]) / 4, endY],
        [endX - (endNode.vGap * plusMinus[0]) / 4, endY],
        hasUnderline ? [endX + (endNode.width - endNode.hGap * 2) * plusMinus[0], endY] : [endX, endY]
    ];

    const stroke = defaultStroke || getLinkLineColorByMindmapElement(child.origin);
    const strokeWidth = child.origin.linkLineWidth ? child.origin.linkLineWidth : STROKE_WIDTH;

    const points = pointsOnBezierCurves(curve);
    return roughSVG.curve(points as any, { stroke, strokeWidth });
}
