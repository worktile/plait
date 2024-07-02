import { PlaitElement } from '@plait/core';
import { ForceAtlasEdgeElement, ForceAtlasElement, ForceAtlasNodeElement } from '../../interfaces';
import { EdgeDirection } from '../types';
import { PlaitCommonElementRef, animate, linear } from '@plait/common';
import { ForceAtlasEdgeGenerator } from '../generators/edge.generator';

export function getEdgeById(id: string, forceAtlasElement: ForceAtlasElement) {
    const edge = forceAtlasElement.children?.find(
        f => ForceAtlasElement.isForceAtlasEdgeElement(f) && f.id === id
    ) as ForceAtlasEdgeElement;
    if (!edge) {
        throw new Error('can not find edge.');
    }
    return edge;
}

export function getEdgesBySourceOrTarget(id: string, forceAtlasElement: ForceAtlasElement) {
    const edges = forceAtlasElement.children?.filter(
        f => ForceAtlasElement.isForceAtlasEdgeElement(f) && (f.source === id || f.target === id)
    ) as ForceAtlasEdgeElement[];
    return edges;
}

export function getEdgesByNodeId(id: string, forceAtlasElement: ForceAtlasElement) {
    const node = forceAtlasElement.children?.find(
        f => ForceAtlasElement.isForceAtlasNodeElement(f) && f.id === id
    ) as ForceAtlasNodeElement;
    if (!node) {
        throw new Error('can not find node.');
    }
    return getEdgesBySourceOrTarget(id, forceAtlasElement);
}

export function getEdgeGenerator(edge: ForceAtlasEdgeElement) {
    const edgeRef = PlaitElement.getElementRef<PlaitCommonElementRef>(edge);
    return edgeRef.getGenerator<ForceAtlasEdgeGenerator>(ForceAtlasEdgeGenerator.key);
}

export function getEdgeDirection(isSourceActive: boolean, isTargetActive: boolean) {
    if (isSourceActive) {
        return EdgeDirection.OUT;
    } else if (isTargetActive) {
        return EdgeDirection.IN;
    }
    return EdgeDirection.NONE;
}

export function playEdgeParticleAnimate(path: SVGPathElement, pointG: SVGGElement) {
    const pathLength = path.getTotalLength();
    let anim = animate(
        (t: number) => {
            const point = path.getPointAtLength(t * pathLength);
            pointG.setAttribute('transform', `translate(${point.x}, ${point.y})`);
        },
        1000,
        linear,
        () => {
            anim = playEdgeParticleAnimate(path, pointG);
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
