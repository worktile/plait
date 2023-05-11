import { PlaitBoard, PlaitElement } from '@plait/core';
import { AbstractNode } from '@plait/layouts';
import { Path } from 'slate';

export function findNewChildNodePath(board: PlaitBoard, element: PlaitElement) {
    return PlaitBoard.findPath(board, element).concat((element.children || []).filter(child => !AbstractNode.isAbstract(child)).length);
}

export function findNewSiblingNodePath(board: PlaitBoard, element: PlaitElement) {
    const path = PlaitBoard.findPath(board, element);
    return Path.next(path);
}
