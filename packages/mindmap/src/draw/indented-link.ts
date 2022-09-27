import { pointsOnBezierCurves } from 'points-on-curve';
import { RoughSVG } from 'roughjs/bin/svg';
import { MindmapNodeShape, STROKE_WIDTH } from '../constants';
import { MindmapNode } from '../interfaces/node';
import { getLinkLineColorByMindmapElement } from '../utils/colors';
import { Point } from '@plait/core';
import { getCorrectLayoutByElement, getNodeShapeByElement, getRectangleByNode, isChildUp } from '../utils';
import { MindmapLayoutType } from '@plait/layouts';

export function drawIndentedLink(
    roughSVG: RoughSVG,
    node: MindmapNode,
    child: MindmapNode,
    defaultStroke: string | null = null,
    needDrawUnderline = true
) {
    const isUnderlineShap = (getNodeShapeByElement(child.origin) as MindmapNodeShape) === MindmapNodeShape.underline;
    let beginX,
        beginY,
        endX,
        endY,
        beginNode = node,
        endNode = child;
    const beginRectangle = getRectangleByNode(beginNode);
    const endRectangle = getRectangleByNode(endNode);

    beginX = beginNode.x + beginNode.width / 2;
    beginY = isChildUp(node, child) ? beginRectangle.y : beginRectangle.y + beginRectangle.height;
    endX = node.left ? endNode.x + endNode.hGap + endRectangle.width : endNode.x + endNode.hGap;
    endY = isUnderlineShap ? endNode.y + endNode.height - endNode.vGap : endNode.y + endNode.height / 2;
    //根据位置，设置正负参数
    let plusMinus = isChildUp(node, child) ? (node.left ? [-1, -1] : [1, -1]) : node.left ? [-1, 1] : [1, 1];
    const layout = getCorrectLayoutByElement(node.origin);
    const strokeWidth = child.origin.linkLineWidth ? child.origin.linkLineWidth : STROKE_WIDTH;
    if (beginNode.origin.isRoot) {
        if (layout === MindmapLayoutType.leftBottomIndented || layout === MindmapLayoutType.rightBottomIndented) {
            beginY += strokeWidth;
        }
        if (layout === MindmapLayoutType.leftTopIndented || layout === MindmapLayoutType.rightTopIndented) {
            beginY -= strokeWidth;
        }
    }
    let curve: Point[] = [
        [beginX, beginY],
        [beginX, beginY],
        [beginX, beginY],
        [beginX, endY - (endNode.hGap * 3 * plusMinus[1]) / 5],
        [beginX, endY - (endNode.hGap * plusMinus[1]) / 5],
        [beginX + (endNode.hGap * plusMinus[0]) / 4, endY],
        [beginX + (endNode.hGap * plusMinus[0] * 3) / 5, endY],
        isUnderlineShap && needDrawUnderline ? [endX + (endNode.width - endNode.hGap * 2) * plusMinus[0], endY] : [endX, endY],
        isUnderlineShap && needDrawUnderline ? [endX + (endNode.width - endNode.hGap * 2) * plusMinus[0], endY] : [endX, endY],
        isUnderlineShap && needDrawUnderline ? [endX + (endNode.width - endNode.hGap * 2) * plusMinus[0], endY] : [endX, endY]
    ];

    const stroke = defaultStroke || getLinkLineColorByMindmapElement(child.origin);

    const points = pointsOnBezierCurves(curve);
    return roughSVG.curve(points as any, { stroke, strokeWidth });
}
