import { pointsOnBezierCurves } from 'points-on-curve';
import { RoughSVG } from 'roughjs/bin/svg';
import { MindmapNodeShape, STROKE_WIDTH } from '../constants';
import { MindmapElement } from '../interfaces';
import { MindmapNode } from '../interfaces/node';
import { getLinkLineColorByMindmapElement } from '../utils/colors';
import { Point } from '@plait/core';
import { getLayoutByElement, getNodeShapeByElement, getRectangleByNode } from '../utils';
import { MindmapLayoutType, isTopLayout } from '@plait/layouts';

export function drawLink(
    roughSVG: RoughSVG,
    node: MindmapNode,
    child: MindmapNode,
    defaultStroke: string | null = null,
    isHorizontal = true
) {
    let beginX,
        beginY,
        endX,
        endY,
        beginNode = node,
        endNode = child;
    if (isHorizontal) {
        if (node.x > child.x) {
            beginNode = child;
            endNode = node;
        }
        beginX = Math.round(beginNode.x + beginNode.width - beginNode.hGap);
        beginY = Math.round(beginNode.y + beginNode.height / 2);
        endX = Math.round(endNode.x + endNode.hGap);
        endY = Math.round(endNode.y + endNode.height / 2);
    } else {
        if (node.y > child.y) {
            beginNode = child;
            endNode = node;
        }
        beginX = Math.round(beginNode.x + beginNode.width / 2);
        beginY = Math.round(beginNode.y + beginNode.height - beginNode.vGap);
        endX = Math.round(endNode.x + endNode.width / 2);
        endY = Math.round(endNode.y + endNode.vGap);
    }

    if (beginNode.origin.isRoot && (getNodeShapeByElement(node.origin) as MindmapNodeShape) === MindmapNodeShape.roundRectangle) {
        beginX = Math.round(beginNode.x + beginNode.width / 2);
        beginY = Math.round(beginNode.y + beginNode.height / 2);
    }

    const stroke = defaultStroke || getLinkLineColorByMindmapElement(child.origin);
    const strokeWidth = child.origin.linkLineWidth ? child.origin.linkLineWidth : STROKE_WIDTH;

    if (isHorizontal) {
        let curve: Point[] = [
            [beginX, beginY],
            [Math.round(beginX + (beginNode.hGap + endNode.hGap) / 3), beginY],
            [Math.round(endX - (beginNode.hGap + endNode.hGap) / 2), endY],
            [endX, endY]
        ];
        const shape = getNodeShapeByElement(child.origin) as MindmapNodeShape;

        if (!node.origin.isRoot) {
            if (node.x > child.x) {
                curve = [
                    [beginX, beginY],
                    [Math.round(beginX + (beginNode.hGap + endNode.hGap) / 3), beginY],
                    [Math.round(endX - (beginNode.hGap + endNode.hGap) / 2), endY],
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
                    [Math.round(beginX + (beginNode.hGap + endNode.hGap) / 2), beginY],
                    [Math.round(endX - (beginNode.hGap + endNode.hGap) / 3), endY],
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

        if (shape === MindmapNodeShape.underline) {
            if (child.left) {
                const underline = [
                    [Math.round(beginX - (beginNode.width - beginNode.hGap * 2)), beginY],
                    [Math.round(beginX - (beginNode.width - beginNode.hGap * 2)), beginY],
                    [Math.round(beginX - (beginNode.width - beginNode.hGap * 2)), beginY]
                ] as Point[];
                curve = [...underline, ...curve];
            } else {
                const underline = [
                    [endX, endY],
                    [endX, endY],
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
            [beginX, Math.round(beginY + (beginNode.vGap + endNode.vGap) / 2)],
            [endX, Math.round(endY - (beginNode.vGap + endNode.vGap) / 2)],
            [endX, endY]
        ];
        const layout = getLayoutByElement(node.origin) as MindmapLayoutType;

        if (!node.origin.isRoot) {
            if (isTopLayout(layout)) {
                curve = [
                    [beginX, beginY],
                    [beginX, Math.round(beginY + (beginNode.vGap + endNode.vGap) / 2)],
                    [endX, Math.round(endY - (beginNode.vGap + endNode.vGap) / 2)],
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
                    [beginX, Math.round(beginY + (beginNode.vGap + endNode.vGap) / 2)],
                    [endX, Math.round(endY - (beginNode.vGap + endNode.vGap) / 2)],
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
