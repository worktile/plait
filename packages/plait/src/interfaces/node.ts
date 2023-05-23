import { PlaitElement } from './element';
import { PlaitBoard } from './board';
import { Path } from './path';

export type PlaitNode = PlaitElement;

export type Ancestor = PlaitBoard | PlaitElement;

export interface NodeParentsOptions {
    reverse?: boolean;
}

export const PlaitNode = {
    parent: (board: PlaitBoard, path: Path) => {
        const parentPath = Path.parent(path);
        const p = PlaitNode.get(board, parentPath);
        return p;
    },
    /**
     * Return a generator of all the ancestor nodes above a specific path.
     *
     * By default the order is top-down, from highest to lowest ancestor in
     * the tree, but you can pass the `reverse: true` option to go bottom-up.
     */
    *parents(root: PlaitBoard, path: Path, options: NodeParentsOptions = {}): Generator<PlaitNode, void, undefined> {
        for (const p of Path.ancestors(path, options)) {
            const n = PlaitNode.get(root, p);
            yield n;
        }
    },
    get<T extends PlaitNode = PlaitNode>(root: PlaitBoard, path: Path): T {
        let node: Ancestor = root;
        for (let i = 0; i < path.length; i++) {
            const p = path[i];
            if (!node || !node.children || !node.children[p]) {
                throw new Error(`Cannot find a descendant at path [${path}]`);
            }
            node = node.children[p];
        }
        return node as T;
    },
    last(board: PlaitBoard, path: Path) {
        let n = PlaitNode.get(board, path);
        while (n && n.children && n.children.length > 0) {
            const i = n.children.length - 1;
            n = n.children[i];
        }
        return n;
    }
};
