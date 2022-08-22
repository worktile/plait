import { pointsOnBezierCurves } from 'points-on-curve';
import { RoughSVG } from 'roughjs/bin/svg';
import { STROKE_WIDTH } from '../constants';
import { MindmapElement } from '../interfaces';
import { MindmapNode } from '../interfaces/node';
import { getLinkLineColorByMindmapElement } from '../utils/colors';
import { Point } from '@plait/core';
import { getRectangleByNode } from '../utils';

export function drawIndentedLink(roughSVG: RoughSVG, node: MindmapNode, child: MindmapNode, defaultStroke: string | null = null) {
    const hasUnderline = MindmapElement.hasUnderlineShape(child.origin);
    let beginX,
        beginY,
        endX,
        endY,
        beginNode = node,
        endNode = child;
    const beginRectangle = getRectangleByNode(beginNode);
    beginX = Math.round(beginNode.x + beginNode.width / 2);
    beginY = Math.round(beginRectangle.y + beginRectangle.height);
    endX = Math.round(endNode.x + endNode.hgap);
    endY = hasUnderline ? Math.round(endNode.y + endNode.height - endNode.vgap) : Math.round(endNode.y + endNode.height / 2);

    const stroke = defaultStroke || getLinkLineColorByMindmapElement(child.origin);
    const strokeWidth = child.origin.linkLineWidth ? child.origin.linkLineWidth : STROKE_WIDTH;

    let curve: Point[] = [
        [beginX, beginY],
        [beginX, endY],
        [beginX, endY],
        [beginX, endY],
        [endX, endY],
        [endX, endY],
        hasUnderline ? [endX + (endNode.width - endNode.hgap * 2), endY] : [endX, endY]
    ];

    const points = pointsOnBezierCurves(curve);
    return roughSVG.curve(points as any, { stroke, strokeWidth });
}
