import { pointsOnBezierCurves } from 'points-on-curve';
import { RoughSVG } from 'roughjs/bin/svg';
import { GRAY_COLOR, MindmapNodeShape, STROKE_WIDTH } from '../constants';
import { MindmapNode } from '../interfaces/node';
import { getLinkLineColorByMindmapElement } from '../utils/colors';
import { PlaitBoard, Point, getRectangleByElements } from '@plait/core';
import { getNodeShapeByElement, getRectangleByNode, isChildRight } from '../utils';
import { MindmapLayoutType, isTopLayout, isIndentedLayout, isStandardLayout } from '@plait/layouts';
import { MindmapQueries } from '../queries';

export function drawLink(
    roughSVG: RoughSVG,
    node: MindmapNode,
    child: MindmapNode,
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
    const layout = MindmapQueries.getCorrectLayoutByElement(node.origin) as MindmapLayoutType;
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
            isIndentedLayout(MindmapQueries.getLayoutByElement(node.parent?.origin)) &&
            (getNodeShapeByElement(node.origin) as MindmapNodeShape) === MindmapNodeShape.underline
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

    const stroke = defaultStroke || getLinkLineColorByMindmapElement(child.origin);
    const strokeWidth = child.origin.linkLineWidth ? child.origin.linkLineWidth : STROKE_WIDTH;
    if (endNode.origin.isRoot) {
        if (layout === MindmapLayoutType.left || isStandardLayout(layout)) {
            endX -= strokeWidth;
        }
        if (layout === MindmapLayoutType.upward) {
            endY -= strokeWidth;
        }
    }
    if (beginNode.origin.isRoot) {
        if (layout === MindmapLayoutType.right || isStandardLayout(layout)) {
            beginX += strokeWidth;
        }
        if (layout === MindmapLayoutType.downward) {
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
        const shape = getNodeShapeByElement(child.origin) as MindmapNodeShape;

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

        if (needDrawUnderline && shape === MindmapNodeShape.underline) {
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
        return roughSVG.curve(points as any, { stroke, strokeWidth });
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
        return roughSVG.curve(points as any, { stroke, strokeWidth });
    }
}

export function drawAbstractLink(roughSVG: RoughSVG, board: PlaitBoard, node: MindmapNode, parent: MindmapNode) {
    const startNode = parent.children[node.origin.start!];
    const endNode = parent.children[node.origin.end!];
    const startRec = getRectangleByElements(board, [startNode.origin], true);
    const endRec = getRectangleByElements(board, [endNode.origin], true);
    const abstractRec = getRectangleByNode(node);
    let contentNode = parent.children.slice(node.origin.start, node.origin.end! + 1).map(node => {
        return node.origin;
    });
    const contentRec = getRectangleByElements(board, contentNode, true);
    const y = contentRec.y + contentRec.height;
    const startPoint: Point = [startRec.x, y + 10];
    const endPoint: Point = [endRec.x + endRec.width, y + 10];
    const abstractRecCenter: Point = [abstractRec.x + abstractRec.width / 2, abstractRec.y - 10];
    return roughSVG.path(
        `M${startPoint[0]},${startPoint[1]} Q${startPoint[0]},${abstractRecCenter[1]} ${abstractRecCenter[0]},${abstractRecCenter[1]} Q${
            endPoint[0]
        },${abstractRecCenter[1]} ${endPoint[0]},${endPoint[1]} M${abstractRecCenter[0]},${abstractRecCenter[1] + 10} L${
            abstractRecCenter[0]
        },${abstractRecCenter[1]}`,
        {
            stroke: GRAY_COLOR,
            strokeWidth: 2
        }
    );
}
