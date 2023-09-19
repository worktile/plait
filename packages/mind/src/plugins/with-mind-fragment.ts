import {
    Path,
    PlaitBoard,
    PlaitNode,
    addSelectedElement
} from '@plait/core';
import { MindElement } from '../interfaces';
import { AbstractNode } from '@plait/layouts';
import { getFirstLevelElement } from '../utils/mind';
import { deleteElementsHandleRightNodeCount } from '../utils/node/right-node-count';
import { MindTransforms } from '../transforms';
import { deleteElementHandleAbstract } from '../utils/abstract/common';
import { getSelectedMindElements } from '../utils/node/common';
import { PlaitMindBoard } from './with-mind.board';

export const withMindFragment = (baseBoard: PlaitBoard) => {
    const board = baseBoard as PlaitBoard & PlaitMindBoard;
    const { deleteFragment } = board;

    board.deleteFragment = (data: DataTransfer | null) => {
        const targetMindElements = getSelectedMindElements(board);
        if (targetMindElements.length) {
            const firstLevelElements = getFirstLevelElement(targetMindElements).reverse();
            const abstractRefs = deleteElementHandleAbstract(board, firstLevelElements);
            MindTransforms.setAbstractsByRefs(board, abstractRefs);

            const refs = deleteElementsHandleRightNodeCount(board, targetMindElements);
            MindTransforms.setRightNodeCountByRefs(board, refs);

            MindTransforms.removeElements(board, targetMindElements);

            const nextSelected = getNextSelectedElement(board, firstLevelElements);
            if (nextSelected) {
                addSelectedElement(board, nextSelected);
            }
        }
        deleteFragment(data);
    };

    return board;
};

export const getNextSelectedElement = (board: PlaitBoard, firstLevelElements: MindElement[]) => {
    let activeElement: MindElement | undefined;
    const firstLevelElement = firstLevelElements[0];
    const firstLevelElementPath = PlaitBoard.findPath(board, firstLevelElement);

    let nextSelectedPath = firstLevelElementPath;
    if (Path.hasPrevious(firstLevelElementPath)) {
        nextSelectedPath = Path.previous(firstLevelElementPath);
    }

    if (AbstractNode.isAbstract(firstLevelElement)) {
        const parent = MindElement.getParent(firstLevelElement);
        if (!firstLevelElements.includes(parent.children[firstLevelElement.start])) {
            activeElement = parent.children[firstLevelElement.start];
        }
    }

    try {
        if (!activeElement) {
            activeElement = PlaitNode.get<MindElement>(board, nextSelectedPath);
        }
    } catch (error) {}

    const firstElement = firstLevelElements[0];
    const firstElementParent = MindElement.findParent(firstElement);
    const hasSameParent = firstLevelElements.every(element => {
        return MindElement.findParent(element) === firstElementParent;
    });
    if (firstElementParent && hasSameParent && !activeElement) {
        activeElement = firstElementParent;
    }
    return activeElement;
};
