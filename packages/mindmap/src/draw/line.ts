import { pointsOnBezierCurves } from 'points-on-curve';
import { Point } from 'roughjs/bin/geometry';
import { RoughSVG } from 'roughjs/bin/svg';
import { MindmapNode } from '../interfaces/node';

export function drawLine(roughSVG: RoughSVG, node: MindmapNode, child: MindmapNode, isHorizontal = false, scale = 1) {
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
    if (beginNode.origin.isRoot) {
        beginX = Math.round(beginNode.x + beginNode.width / 2);
        beginY = Math.round(beginNode.y + beginNode.height / 2);
    }
    if (endNode.origin.isRoot) {
        endX = Math.round(endNode.x + endNode.width / 2);
        endY = Math.round(endNode.y + endNode.height / 2);
    }
    if (isHorizontal) {
        const curve: Point[] = [
            [beginX / scale, beginY / scale],
            [Math.round(beginX + (beginNode.hgap + endNode.hgap) / 2) / scale, beginY / scale],
            [Math.round(endX - (beginNode.hgap + endNode.hgap) / 2) / scale, endY / scale],
            [endX / scale, endY / scale]
        ];
        const points = pointsOnBezierCurves(curve);
        return roughSVG.curve(points as any, { stroke: '#e67700' });
    } else {
        const curve: Point[] = [
            [beginX / scale, beginY / scale],
            [beginX / scale, Math.round(beginY + (beginNode.vgap + endNode.vgap) / 2) / scale],
            [endX / scale, Math.round(endY - (beginNode.vgap + endNode.vgap) / 2) / scale],
            [endX / scale, endY / scale]
        ];
        const points = pointsOnBezierCurves(curve);
        return roughSVG.curve(points as any, { stroke: '#e67700' });
    }
}
