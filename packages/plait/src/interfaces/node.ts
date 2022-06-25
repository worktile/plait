import { PlaitBoard } from './board';
import { Path } from './path';

export interface PlaitNode {
    [key: string]: any;
    children?: PlaitNode[];
    id?: string;
}

export type Ancestor = PlaitBoard | PlaitNode;

export interface PlaitNodeInterface {
    parent: (board: PlaitBoard, path: Path) => Ancestor;
    get: (board: PlaitBoard, path: Path) => PlaitNode;
}

export const PlaitNode: PlaitNodeInterface = {
    parent: (board: PlaitBoard, path: Path) => {
        const parentPath = Path.parent(path);
        const p = PlaitNode.get(board, parentPath);
        return p;
    },
    get(board: PlaitBoard, path: Path): Ancestor {
        let node: PlaitBoard | PlaitNode = board;

        for (let i = 0; i < path.length; i++) {
            const p = path[i];

            if (!node || !node.children || !node.children[p]) {
                throw new Error(`Cannot find a descendant at path [${path}]`);
            }

            node = node.children[p];
        }

        return node;
    }
};
