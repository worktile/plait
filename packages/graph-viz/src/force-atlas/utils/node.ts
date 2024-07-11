import {
    PlaitBoard,
    PlaitElement,
    Point,
    RectangleClient,
    Transforms,
    clearViewportOrigination,
    getRealScrollBarWidth,
    getSelectedElements,
    getViewBoxCenterPoint,
    normalizePoint
} from '@plait/core';
import { ForceAtlasElement, ForceAtlasNodeElement } from '../../interfaces';
import { getEdges, getEdgesInSourceOrTarget } from './edge';
import { animate, linear, PlaitCommonElementRef } from '@plait/common';
import { ForceAtlasNodeGenerator } from '../generators/node.generator';
import { DEFAULT_NODE_ICON_COLOR, NODE_ICON_FONT_SIZE } from '../constants';

export function getNodes(forceAtlasElement: ForceAtlasElement, andBack?: (edge: ForceAtlasNodeElement) => boolean) {
    return forceAtlasElement.children?.filter(
        f => ForceAtlasElement.isForceAtlasNodeElement(f) && (andBack?.(f) ?? true)
    ) as ForceAtlasNodeElement[];
}

export function getNodeById(id: string, forceAtlasElement: ForceAtlasElement) {
    const node = getNodes(forceAtlasElement, node => node.id === id)?.[0];
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
    const edges = getEdgesInSourceOrTarget(id, forceAtlasElement);
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

export function isFirstDepthNode(currentNodeId: string, activeNodeId: string, forceAtlasElement: ForceAtlasElement) {
    const edges = getEdges(forceAtlasElement);
    return edges.some(
        s => (s.source === activeNodeId && s.target === currentNodeId) || (s.target === activeNodeId && s.source === currentNodeId)
    );
}

export function getNodeIcon(node: ForceAtlasNodeElement) {
    const iconItem = typeof node.icon === 'object' && node.icon.name ? node.icon : null;
    return {
        name: iconItem ? iconItem.name : (node.icon as string),
        fontSize: (iconItem && iconItem.fontSize) || NODE_ICON_FONT_SIZE,
        color: (iconItem && iconItem.color) || DEFAULT_NODE_ICON_COLOR
    };
}
