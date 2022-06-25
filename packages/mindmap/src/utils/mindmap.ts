import { Path, PlaitBoard } from "plait";
import { isPlaitMindmap, MindmapNode } from "../interfaces";

export function findPath(board: PlaitBoard, node: MindmapNode): Path {
    const path = [];
    let _node = node;
    while (_node.parent) {
        const index = _node.parent.children.indexOf(_node);
        path.push(index);
        _node = _node.parent;
    }
    if (isPlaitMindmap(_node.origin)) {
        const index = board.children.indexOf(_node.origin);
        path.push(index);
    }
    return path.reverse();
}
