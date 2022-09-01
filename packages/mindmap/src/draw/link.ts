import { pointsOnBezierCurves } from 'points-on-curve';
import { RoughSVG } from 'roughjs/bin/svg';
import { MindmapNodeShape, STROKE_WIDTH } from '../constants';
import { MindmapElement } from '../interfaces';
import { MindmapNode } from '../interfaces/node';
import { getLinkLineColorByMindmapElement } from '../utils/colors';
import { Point } from '@plait/core';
import { getNodeShapeByElement, getRectangleByNode } from '../utils';

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
        if (shape === MindmapNodeShape.underline) {
            if (child.left) {
                const underline = [
                    [beginX - (beginNode.width - beginNode.hGap * 2), beginY],
                    [beginX, beginY],
                    [beginX, beginY]
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
        const curve: Point[] = [
            [beginX, beginY],
            [beginX, Math.round(beginY + (beginNode.vGap + endNode.vGap) / 2)],
            [endX, Math.round(endY - (beginNode.vGap + endNode.vGap) / 2)],
            [endX, endY]
        ];
        const points = pointsOnBezierCurves(curve);
        return roughSVG.curve(points as any, { stroke, strokeWidth });
    }
}
