import { PlaitBoard, PlaitElement } from '@plait/core';
import { getNonAbstractChildren } from '@plait/layouts';
import { Path } from 'slate';
import { PlaitMind } from '../interfaces';

export function findNewChildNodePath(board: PlaitBoard, element: PlaitElement) {
    const children = getNonAbstractChildren(element);
    return PlaitBoard.findPath(board, element).concat(children.length);
}

export function findNewRightChildNodePath(board: PlaitBoard, element: PlaitMind, rightNodeCount: number) {
    return PlaitBoard.findPath(board, element).concat(rightNodeCount ? rightNodeCount - 1 : 0);
}

export function findNewSiblingNodePath(board: PlaitBoard, element: PlaitElement) {
    const path = PlaitBoard.findPath(board, element);
    return Path.next(path);
}
