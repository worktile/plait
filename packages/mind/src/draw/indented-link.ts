import { pointsOnBezierCurves } from 'points-on-curve';
import { MindNode } from '../interfaces/node';
import { PlaitBoard, Point } from '@plait/core';
import { getShapeByElement, getRectangleByNode, isChildUp } from '../utils';
import { MindLayoutType } from '@plait/layouts';
import { MindQueries } from '../queries';
import { getBranchColorByMindElement, getBranchWidthByMindElement } from '../utils/node-style/branch';
import { MindElementShape } from '../interfaces/element';

export function drawIndentedLink(
    board: PlaitBoard,
    node: MindNode,
    child: MindNode,
    defaultStroke: string | null = null,
    needDrawUnderline = true
) {
    const branchWidth = getBranchWidthByMindElement(board, child.origin);
    const branchColor = defaultStroke || getBranchColorByMindElement(board, child.origin);

    const isUnderlineShape = (getShapeByElement(board, child.origin) as MindElementShape) === MindElementShape.underline;
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
    endY = isUnderlineShape ? endNode.y + endNode.height - endNode.vGap : endNode.y + endNode.height / 2;
    //根据位置，设置正负参数
    let plusMinus = isChildUp(node, child) ? (node.left ? [-1, -1] : [1, -1]) : node.left ? [-1, 1] : [1, 1];
    const layout = MindQueries.getCorrectLayoutByElement(board, node.origin);
    if (beginNode.origin.isRoot) {
        if (layout === MindLayoutType.leftBottomIndented || layout === MindLayoutType.rightBottomIndented) {
            beginY += branchWidth;
        }
        if (layout === MindLayoutType.leftTopIndented || layout === MindLayoutType.rightTopIndented) {
            beginY -= branchWidth;
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
        isUnderlineShape && needDrawUnderline ? [endX + (endNode.width - endNode.hGap * 2) * plusMinus[0], endY] : [endX, endY],
        isUnderlineShape && needDrawUnderline ? [endX + (endNode.width - endNode.hGap * 2) * plusMinus[0], endY] : [endX, endY],
        isUnderlineShape && needDrawUnderline ? [endX + (endNode.width - endNode.hGap * 2) * plusMinus[0], endY] : [endX, endY]
    ];

    const points = pointsOnBezierCurves(curve);
    return PlaitBoard.getRoughSVG(board).curve(points as any, { stroke: branchColor, strokeWidth: branchWidth });
}
