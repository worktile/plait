import { PlaitBoard, PlaitElement } from '@plait/core';
import { Path } from 'slate';

export function findNewChildNodePath(board: PlaitBoard, element: PlaitElement) {
    const path = PlaitBoard.findPath(board, element);
    return path.concat((element.children || []).length);
}

export function findNewSiblingNodePath(board: PlaitBoard, element: PlaitElement) {
    const path = PlaitBoard.findPath(board, element);
    return Path.next(path);
}
