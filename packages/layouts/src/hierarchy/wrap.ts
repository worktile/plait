import { Tree } from '../algorithms/tree';
import { Node } from './node';

export const wrap = (root: Node, isHorizontal: boolean) => {
    const children: Tree[] = [];
    root.children.forEach(child => {
        children.push(wrap(child, isHorizontal));
    });
    if (isHorizontal) return new Tree(root.height, root.width, root.x, children, root.origin);
    return new Tree(root.width, root.height, root.y, children, root.origin);
};
