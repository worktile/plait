import { InsertNodeOperation, RemoveNodeOperation, SetNodeOperation } from '../interfaces/operation';
import { PlaitBoard } from '../interfaces/board';
import { PlaitNode } from '../interfaces/node';
import { Path } from '../interfaces/path';

export function insertNode(board: PlaitBoard, node: PlaitNode, path: Path) {
    const operation: InsertNodeOperation = { type: 'insert_node', node, path };
    board.apply(operation);
}

export function setNode(board: PlaitBoard, props: Partial<PlaitNode>, path: Path) {
    const properties: Partial<PlaitNode> = {};
    const newProperties: Partial<PlaitNode> = {};
    const node = PlaitNode.get(board, path);
    for (const k in props) {
        if (node[k] !== props[k]) {
            if (node.hasOwnProperty(k)) {
                properties[k] = node[k];
            }
            if (props[k] != null) newProperties[k] = props[k];
        }
    }
    const operation: SetNodeOperation = { type: 'set_node', properties, newProperties, path };
    board.apply(operation);
}

export function removeNode(board: PlaitBoard, path: Path) {
    const operation: RemoveNodeOperation = { type: 'remove_node', path };
    board.apply(operation);
}

export interface NodeTransforms {
    insertNode: (board: PlaitBoard, node: PlaitNode, path: Path) => void;
    setNode: (board: PlaitBoard, node: Partial<PlaitNode>, path: Path) => void;
    removeNode: (board: PlaitBoard, path: Path) => void;
}

export const NodeTransforms: NodeTransforms = {
    insertNode,
    setNode,
    removeNode
};
