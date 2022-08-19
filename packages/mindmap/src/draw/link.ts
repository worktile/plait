import { pointsOnBezierCurves } from 'points-on-curve';
import { RoughSVG } from 'roughjs/bin/svg';
import { STROKE_WIDTH } from '../constants';
import { MindmapElement } from '../interfaces';
import { MindmapNode } from '../interfaces/node';
import { getLinkLineColorByMindmapElement } from '../utils/colors';
import { Point } from '@plait/core';

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
        beginX = Math.round(beginNode.x + beginNode.width - beginNode.hgap);
        beginY = Math.round(beginNode.y + beginNode.height / 2);
        endX = Math.round(endNode.x + endNode.hgap);
        endY = Math.round(endNode.y + endNode.height / 2);
    } else {
        if (node.y > child.y) {
            beginNode = child;
            endNode = node;
        }
        beginX = Math.round(beginNode.x + beginNode.width / 2);
        beginY = Math.round(beginNode.y + beginNode.height - beginNode.vgap);
        endX = Math.round(endNode.x + endNode.width / 2);
        endY = Math.round(endNode.y + endNode.vgap);
    }

    if (beginNode.origin.isRoot && MindmapElement.hasRoundRectangleShape(node.origin)) {
        beginX = Math.round(beginNode.x + beginNode.width / 2);
        beginY = Math.round(beginNode.y + beginNode.height / 2);
    }

    const stroke = defaultStroke || getLinkLineColorByMindmapElement(child.origin);
    const strokeWidth = child.origin.linkLineWidth ? child.origin.linkLineWidth : STROKE_WIDTH;

    if (isHorizontal) {
        let curve: Point[] = [
            [beginX, beginY],
            [Math.round(beginX + (beginNode.hgap + endNode.hgap) / 3), beginY],
            [Math.round(endX - (beginNode.hgap + endNode.hgap) / 2), endY],
            [endX, endY]
        ];
        if (MindmapElement.hasUnderlineShape(child.origin)) {
            if (child.left) {
                const underline = [
                    [beginX - (beginNode.width - beginNode.hgap * 2), beginY],
                    [beginX, beginY],
                    [beginX, beginY]
                ] as Point[];
                curve = [...underline, ...curve];
            } else {
                const underline = [
                    [endX, endY],
                    [endX, endY],
                    [endX + (endNode.width - endNode.hgap * 2), endY]
                ] as Point[];
                curve = [...curve, ...underline];
            }
        }
        const points = pointsOnBezierCurves(curve);
        return roughSVG.curve(points as any, { stroke, strokeWidth });
    } else {
        const curve: Point[] = [
            [beginX, beginY],
            [beginX, Math.round(beginY + (beginNode.vgap + endNode.vgap) / 2)],
            [endX, Math.round(endY - (beginNode.vgap + endNode.vgap) / 2)],
            [endX, endY]
        ];
        const points = pointsOnBezierCurves(curve);
        return roughSVG.curve(points as any, { stroke, strokeWidth });
    }
}
