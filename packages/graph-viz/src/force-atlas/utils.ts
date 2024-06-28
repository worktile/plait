import { EdgeDirection } from './types';
import { animate, linear } from '../utils/animate';
import { ForceAtlasEdgeElement, ForceAtlasElement, ForceAtlasNodeElement } from '../interfaces';
import { PlaitBoard, PlaitElement } from '@plait/core';

export function getNodeById(id: string, plaitElement: PlaitElement) {
    const node = plaitElement.children?.find(f => ForceAtlasElement.isForceAtlasNodeElement(f) && f.id === id) as ForceAtlasNodeElement;
    if (!node) {
        throw new Error('can not find node.');
    }
    return node;
}

export function getEdgeById(id: string, plaitElement: PlaitElement) {
    const edge = plaitElement.children?.find(f => ForceAtlasElement.isForceAtlasEdgeElement(f) && f.id === id) as ForceAtlasEdgeElement;
    if (!edge) {
        throw new Error('can not find edge.');
    }
    return edge;
}

export function getIsNodeActive(id: string, nodes: ForceAtlasNodeElement[]) {
    return nodes.find(node => node.id === id)?.isActive || false;
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
