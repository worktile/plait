import { pointsOnBezierCurves } from 'points-on-curve';
import { STROKE_WIDTH } from '../constants';
import { MindNode } from '../interfaces/node';
import { PlaitBoard, Point } from '@plait/core';
import { getNodeShapeByElement, isChildRight } from '../utils';
import { MindLayoutType, isTopLayout, isIndentedLayout, isStandardLayout } from '@plait/layouts';
import { MindQueries } from '../queries';
import { getBranchColorByMindElement } from '../utils/node-style/branch';
import { MindElementShape } from '../interfaces/element';

export function drawLink(
    board: PlaitBoard,
    node: MindNode,
    child: MindNode,
    defaultStroke: string | null = null,
    isHorizontal = true,
    needDrawUnderline = true
) {
    let beginX,
        beginY,
        endX,
        endY,
        beginNode = node,
        endNode = child;
    const layout = MindQueries.getCorrectLayoutByElement(board, node.origin) as MindLayoutType;
    if (isHorizontal) {
        if (!isChildRight(node, child)) {
            beginNode = child;
            endNode = node;
        }
        beginX = beginNode.x + beginNode.width - beginNode.hGap;
        beginY = beginNode.y + beginNode.height / 2;
        endX = endNode.x + endNode.hGap;
        endY = endNode.y + endNode.height / 2;

        if (
            node.parent &&
            isIndentedLayout(MindQueries.getLayoutByElement(node.parent?.origin)) &&
            (getNodeShapeByElement(node.origin) as MindElementShape) === MindElementShape.underline
        ) {
            if (isChildRight(node, child)) {
                beginY = node.y + node.height - node.vGap;
            } else {
                endY = node.y + node.height - node.vGap;
            }
        }
    } else {
        if (node.y > child.y) {
            beginNode = child;
            endNode = node;
        }
        beginX = beginNode.x + beginNode.width / 2;
        beginY = beginNode.y + beginNode.height - beginNode.vGap;
        endX = endNode.x + endNode.width / 2;
        endY = endNode.y + endNode.vGap;
    }

    const stroke = defaultStroke || getBranchColorByMindElement(board, child.origin);
    const strokeWidth = child.origin.branchWidth ? child.origin.branchWidth : STROKE_WIDTH;
    if (endNode.origin.isRoot) {
        if (layout === MindLayoutType.left || isStandardLayout(layout)) {
            endX -= strokeWidth;
        }
        if (layout === MindLayoutType.upward) {
            endY -= strokeWidth;
        }
    }
    if (beginNode.origin.isRoot) {
        if (layout === MindLayoutType.right || isStandardLayout(layout)) {
            beginX += strokeWidth;
        }
        if (layout === MindLayoutType.downward) {
            beginY += strokeWidth;
        }
    }
    if (isHorizontal) {
        let curve: Point[] = [
            [beginX, beginY],
            [beginX + (beginNode.hGap + endNode.hGap) / 3, beginY],
            [endX - (beginNode.hGap + endNode.hGap) / 2, endY],
            [endX, endY]
        ];
        const shape = getNodeShapeByElement(child.origin) as MindElementShape;

        if (!node.origin.isRoot) {
            if (node.x > child.x) {
                curve = [
                    [beginX, beginY],
                    [beginX + (beginNode.hGap + endNode.hGap) / 3, beginY],
                    [endX - (beginNode.hGap + endNode.hGap) / 2, endY],
                    [endX - 12, endY]
                ];
                const line = [
                    [endX - 12, endY],
                    [endX - 12, endY],
                    [endX, endY]
                ] as Point[];
                curve = [...curve, ...line];
            } else {
                curve = [
                    [beginX + 12, beginY],
                    [beginX + (beginNode.hGap + endNode.hGap) / 2, beginY],
                    [endX - (beginNode.hGap + endNode.hGap) / 3, endY],
                    [endX, endY]
                ];
                const line = [
                    [beginX, beginY],
                    [beginX + 12, beginY],
                    [beginX + 12, beginY]
                ] as Point[];
                curve = [...line, ...curve];
            }
        }

        if (needDrawUnderline && shape === MindElementShape.underline) {
            if (child.left) {
                const underline = [
                    [beginX - (beginNode.width - beginNode.hGap * 2), beginY],
                    [beginX - (beginNode.width - beginNode.hGap * 2), beginY],
                    [beginX - (beginNode.width - beginNode.hGap * 2), beginY]
                ] as Point[];
                curve = [...underline, ...curve];
            } else {
                const underline = [
                    [endX + (endNode.width - endNode.hGap * 2), endY],
                    [endX + (endNode.width - endNode.hGap * 2), endY],
                    [endX + (endNode.width - endNode.hGap * 2), endY]
                ] as Point[];
                curve = [...curve, ...underline];
            }
        }

        const points = pointsOnBezierCurves(curve);
        return PlaitBoard.getRoughSVG(board).curve(points as any, { stroke, strokeWidth });
    } else {
        let curve: Point[] = [
            [beginX, beginY],
            [beginX, beginY + (beginNode.vGap + endNode.vGap) / 2],
            [endX, endY - (beginNode.vGap + endNode.vGap) / 2],
            [endX, endY]
        ];

        if (!node.origin.isRoot) {
            if (isTopLayout(layout)) {
                curve = [
                    [beginX, beginY],
                    [beginX, beginY + (beginNode.vGap + endNode.vGap) / 2],
                    [endX, endY - (beginNode.vGap + endNode.vGap) / 2],
                    [endX, endY - 12]
                ];

                const line = [
                    [endX, endY - 12],
                    [endX, endY - 12],
                    [endX, endY]
                ] as Point[];
                curve = [...curve, ...line];
            } else {
                curve = [
                    [beginX, beginY + 12],
                    [beginX, beginY + (beginNode.vGap + endNode.vGap) / 2],
                    [endX, endY - (beginNode.vGap + endNode.vGap) / 2],
                    [endX, endY]
                ];
                const line = [
                    [beginX, beginY],
                    [beginX, beginY + 12],
                    [beginX, beginY + 12]
                ] as Point[];

                curve = [...line, ...curve];
            }
        }
        const points = pointsOnBezierCurves(curve);
        return PlaitBoard.getRoughSVG(board).curve(points as any, { stroke, strokeWidth });
    }
}
