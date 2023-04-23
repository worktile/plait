import { PlaitElement } from './element';
import { PlaitBoard } from './board';
import { Path } from './path';

export type PlaitNode = PlaitElement;

export type Ancestor = PlaitBoard | PlaitElement;

export const PlaitNode = {
    parent: (board: PlaitBoard, path: Path) => {
        const parentPath = Path.parent(path);
        const p = PlaitNode.get(board, parentPath);
        return p;
    },
    get(board: PlaitBoard, path: Path): PlaitNode {
        let node: Ancestor = board;
        for (let i = 0; i < path.length; i++) {
            const p = path[i];
            if (!node || !node.children || !node.children[p]) {
                throw new Error(`Cannot find a descendant at path [${path}]`);
            }
            node = node.children[p];
        }
        return node as PlaitNode;
    },
    last(board: PlaitBoard, path: Path) {
        let n = PlaitNode.get(board, path);
        while (n && n.children) {
            const i = n.children.length - 1;
            n = n.children[i];
        }
        return n;
    }
};
