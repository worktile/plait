import { LayoutNode } from '../interfaces/node';
import { LayoutType } from '../types';

export function findLayoutType(node: LayoutNode): string {
    if (node.origin.layout) {
        return node.origin.layout;
    }

    if (node.parent) {
        return findLayoutType(node.parent);
    }

    return LayoutType.logic;
}
