import { PlaitElement } from '@plait/core';
import { ForceAtlasElement, ForceAtlasNodeElement } from '../../interfaces';

export function getNodeById(id: string, plaitElement: PlaitElement) {
    const node = plaitElement.children?.find(f => ForceAtlasElement.isForceAtlasNodeElement(f) && f.id === id) as ForceAtlasNodeElement;
    if (!node) {
        throw new Error('can not find node.');
    }
    return node;
}

export function getIsNodeActive(id: string, nodes: ForceAtlasNodeElement[]) {
    return nodes.find(node => node.id === id)?.isActive || false;
}
