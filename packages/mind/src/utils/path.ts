import { PlaitBoard, PlaitElement } from '@plait/core';
import { getNonAbstractChildren } from '@plait/layouts';
import { Path } from 'slate';

export function findNewChildNodePath(board: PlaitBoard, element: PlaitElement) {
    const children = getNonAbstractChildren(element);
    return PlaitBoard.findPath(board, element).concat(children.length);
}

export function findNewSiblingNodePath(board: PlaitBoard, element: PlaitElement) {
    const path = PlaitBoard.findPath(board, element);
    return Path.next(path);
}
