import { Path, PlaitBoard, PlaitNode, Point, RectangleClient, addSelectedElement, getDataFromClipboard } from '@plait/core';
import { MindElement } from '../interfaces';
import { AbstractNode } from '@plait/layouts';
import { getFirstLevelElement } from '../utils/mind';
import { deleteElementsHandleRightNodeCount } from '../utils/node/right-node-count';
import { MindTransforms } from '../transforms';
import { deleteElementHandleAbstract } from '../utils/abstract/common';
import { getSelectedMindElements } from '../utils/node/common';
import { PlaitMindBoard } from './with-mind.board';
import { buildClipboardData, insertClipboardData, insertClipboardText, setMindClipboardData } from '../utils/clipboard';
import { buildText, getTextFromClipboard } from '@plait/text';

export const withMindFragment = (baseBoard: PlaitBoard) => {
    const board = baseBoard as PlaitBoard & PlaitMindBoard;
    const { deleteFragment, insertFragment, setFragment } = board;

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

    board.setFragment = (data: DataTransfer | null, rectangle: RectangleClient | null) => {
        const targetMindElements = getSelectedMindElements(board);
        const firstLevelElements = getFirstLevelElement(targetMindElements);
        if (firstLevelElements.length) {
            const elements = buildClipboardData(board, firstLevelElements, rectangle ? [rectangle.x, rectangle.y] : [0, 0]);
            setMindClipboardData(data, elements);
        }
        setFragment(data, rectangle);
    };

    board.insertFragment = (data: DataTransfer | null, targetPoint: Point) => {
        const elements = getDataFromClipboard(data);
        const mindElements = elements.filter(value => MindElement.isMindElement(board, value));
        if (elements.length > 0 && mindElements.length > 0) {
            insertClipboardData(board, mindElements, targetPoint);
        } else if (elements.length === 0) {
            const mindElements = getSelectedMindElements(board);
            if (mindElements.length === 1) {
                const text = getTextFromClipboard(data);
                if (text) {
                    insertClipboardText(board, mindElements[0], buildText(text));
                    return;
                }
            }
        }
        insertFragment(data, targetPoint);
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
