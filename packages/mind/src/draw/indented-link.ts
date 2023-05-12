import { pointsOnBezierCurves } from 'points-on-curve';
import { MindNodeShape, STROKE_WIDTH } from '../constants';
import { MindNode } from '../interfaces/node';
import { PlaitBoard, Point } from '@plait/core';
import { getNodeShapeByElement, getRectangleByNode, isChildUp } from '../utils';
import { MindLayoutType } from '@plait/layouts';
import { MindQueries } from '../queries';
import { getBranchColorByMindElement } from '../utils/node-style/branch-style';

export function drawIndentedLink(
    board: PlaitBoard,
    node: MindNode,
    child: MindNode,
    defaultStroke: string | null = null,
    needDrawUnderline = true
) {
    const isUnderlineShap = (getNodeShapeByElement(child.origin) as MindNodeShape) === MindNodeShape.underline;
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
    const layout = MindQueries.getCorrectLayoutByElement(node.origin);
    const strokeWidth = child.origin.branchWidth ? child.origin.branchWidth : STROKE_WIDTH;
    if (beginNode.origin.isRoot) {
        if (layout === MindLayoutType.leftBottomIndented || layout === MindLayoutType.rightBottomIndented) {
            beginY += strokeWidth;
        }
        if (layout === MindLayoutType.leftTopIndented || layout === MindLayoutType.rightTopIndented) {
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

    const stroke = defaultStroke || getBranchColorByMindElement(board, child.origin);

    const points = pointsOnBezierCurves(curve);
    return PlaitBoard.getRoughSVG(board).curve(points as any, { stroke, strokeWidth });
}
