import { RoughSVG } from 'roughjs/bin/svg';
import { STROKE_WIDTH } from '../constants';
import { MindmapNode } from '../interfaces/node';
import { getLinkLineColorByMindmapElement } from '../utils/colors';
import { LayoutNode } from '@plait/layouts';

export function drawFishBoneLink(
    roughSVG: RoughSVG,
    node: MindmapNode,
    child: MindmapNode,
    defaultStroke: string | null = null,
    needDrawUnderline = true
) {
    const stroke = defaultStroke || getLinkLineColorByMindmapElement(child.origin);
    const strokeWidth = child.origin.linkLineWidth ? child.origin.linkLineWidth : STROKE_WIDTH;
    const res: SVGGElement[] = [];
    const centralLineStart = [node.x + node.width - node.hGap, node.y + node.height / 2];
    if (node.children.indexOf(child) === node.children.length - 1 && node.origin.isRoot) {
        const childBoundingBox = ((child as any) as LayoutNode).getBoundingBox();
        // draw root central bone
        res.push(
            roughSVG.line(centralLineStart[0], centralLineStart[1], childBoundingBox.right + 50, centralLineStart[1], {
                stroke,
                strokeWidth
            })
        );
    }
    if (node.origin.isRoot) {
        // draw branch skew bone 30°
        if (child.up) {
            const w = (centralLineStart[1] - (child.y + child.height - child.vGap)) * Math.tan((Math.PI * 30) / 180);
            const end = [child.x + child.width / 2, child.y + child.height - child.vGap];
            const start = [child.x + child.width / 2 - w, centralLineStart[1]];
            res.push(roughSVG.line(start[0], start[1], end[0], end[1], { stroke, strokeWidth }));
        } else {
            const w = (child.y + child.vGap - centralLineStart[1]) * Math.tan((Math.PI * 30) / 180);
            const end = [child.x + child.width / 2, child.y + child.vGap];
            const start = [child.x + child.width / 2 - w, centralLineStart[1]];
            res.push(roughSVG.line(start[0], start[1], end[0], end[1], { stroke, strokeWidth }));
        }
    } else {
        // draw horizontal bone
        if (child.up) {
            const end = [child.x + child.hGap, child.y + child.height / 2];
            const branchBoneEnd = [node.x + node.width / 2, node.y + node.height - node.vGap];
            const x = branchBoneEnd[0] - Math.abs(branchBoneEnd[1] - (child.y + child.height / 2)) * Math.tan((Math.PI * 30) / 180);
            const start = [x, child.y + child.height / 2];
            res.push(roughSVG.line(start[0], start[1], end[0], end[1], { stroke, strokeWidth }));
        } else {
            const end = [child.x + child.hGap, child.y + child.height / 2];
            const branchBoneEnd = [node.x + node.width / 2, node.y + node.vGap];
            const x = branchBoneEnd[0] - Math.abs(branchBoneEnd[1] - (child.y + child.height / 2)) * Math.tan((Math.PI * 30) / 180);
            const start = [x, child.y + child.height / 2];
            res.push(roughSVG.line(start[0], start[1], end[0], end[1], { stroke, strokeWidth }));
        }
    }
    return res;
}
