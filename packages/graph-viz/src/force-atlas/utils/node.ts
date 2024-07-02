import { PlaitBoard, PlaitElement, Point, RectangleClient, isSelectedElement, normalizePoint } from '@plait/core';
import { ForceAtlasEdgeElement, ForceAtlasElement, ForceAtlasNodeElement } from '../../interfaces';
import { getEdgesBySourceOrTarget } from './edge';
import { PlaitCommonElementRef } from '@plait/common';
import { ForceAtlasNodeGenerator } from '../generators/node.generator';

export function getNodeById(id: string, forceAtlasElement: ForceAtlasElement) {
    const node = forceAtlasElement.children?.find(
        f => ForceAtlasElement.isForceAtlasNodeElement(f) && f.id === id
    ) as ForceAtlasNodeElement;
    if (!node) {
        throw new Error('can not find node.');
    }
    return node;
}

export function getIsNodeActive(id: string, selectElements: ForceAtlasNodeElement[]) {
    return selectElements.some(node => node.id === id);
}

export function isHitNode(node: ForceAtlasNodeElement, point: [Point, Point]) {
    const { x, y } = normalizePoint(node.points![0]);
    const size = node.size!;
    const hitFlowNode = RectangleClient.isHit(RectangleClient.getRectangleByPoints(point), {
        x: x - size / 2,
        y: y - size / 2,
        width: size,
        height: size
    });
    return hitFlowNode;
}

export function getAssociatedNodesById(id: string, forceAtlasElement: ForceAtlasElement) {
    const edges = getEdgesBySourceOrTarget(id, forceAtlasElement);
    const nodes: ForceAtlasNodeElement[] = [];
    edges.forEach(edge => {
        nodes.push(getNodeById(edge.source, forceAtlasElement));
        nodes.push(getNodeById(edge.target, forceAtlasElement));
    });
    return nodes;
}

export function getNodeGenerator(node: ForceAtlasNodeElement) {
    const edgeRef = PlaitElement.getElementRef<PlaitCommonElementRef>(node);
    return edgeRef.getGenerator<ForceAtlasNodeGenerator>(ForceAtlasNodeGenerator.key);
}
