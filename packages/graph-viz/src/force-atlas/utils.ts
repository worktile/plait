import Graph from 'graphology';
import { EdgeDirection, EdgeInfo, Node } from './types';
import { AnimateOption, animate, linear } from '../utils/animate';

export function getEdgeInfo(graph: Graph<Node>, edge: string): EdgeInfo {
    const source = graph.source(edge);
    const target = graph.target(edge);
    const outEdges = graph.outEdges(target);
    const isActive = graph.getNodeAttribute(source, 'isActive');
    return {
        isSourceActive: !!isActive,
        isTargetActive: outEdges.length ? !!graph.getNodeAttribute(graph.source(outEdges[0]), 'isActive') : false
    };
}

export function getEdgeDirection(info: { isSourceActive: boolean; isTargetActive: boolean }) {
    if (info.isSourceActive) {
        return EdgeDirection.OUT;
    } else if (info.isTargetActive) {
        return EdgeDirection.IN;
    }
    return EdgeDirection.NONE;
}

export function edgeParticleAnimate(path: SVGPathElement, pointG: SVGGElement) {
    const pathLength = path.getTotalLength();
    let anim = animate(
        (t: number) => {
            const point = path.getPointAtLength(t * pathLength);
            pointG.setAttribute('transform', `translate(${point.x}, ${point.y})`);
        },
        1000,
        linear,
        () => {
            anim = edgeParticleAnimate(path, pointG);
        }
    );
    return {
        stop: () => {
            anim.stop();
        },
        start: () => {
            anim.start();
        }
    };
}
