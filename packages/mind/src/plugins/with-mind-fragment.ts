import {
    Path,
    PlaitBoard,
    PlaitElement,
    PlaitNode,
    Point,
    RectangleClient,
    addSelectedElement,
    geClipboardDataByClipboardApi,
    getClipboardDataByNative,
    setPlaitClipboardData
} from '@plait/core';
import { MindElement } from '../interfaces';
import { AbstractNode } from '@plait/layouts';
import { getFirstLevelElement } from '../utils/mind';
import { deleteElementsHandleRightNodeCount } from '../utils/node/right-node-count';
import { MindTransforms } from '../transforms';
import { deleteElementHandleAbstract } from '../utils/abstract/common';
import { getSelectedMindElements } from '../utils/node/common';
import { PlaitMindBoard } from './with-mind.board';
import { buildClipboardData, insertClipboardData } from '../utils/clipboard';

export const withMindFragment = (baseBoard: PlaitBoard) => {
    const board = baseBoard as PlaitBoard & PlaitMindBoard;
    const { getDeletedFragment, insertFragment, setFragment } = board;

    board.getDeletedFragment = (data: PlaitElement[]) => {
        const targetMindElements = getSelectedMindElements(board);
        if (targetMindElements.length) {
            const firstLevelElements = getFirstLevelElement(targetMindElements).reverse();
            const abstractRefs = deleteElementHandleAbstract(board, firstLevelElements);
            MindTransforms.setAbstractsByRefs(board, abstractRefs);
            const refs = deleteElementsHandleRightNodeCount(board, targetMindElements);
            MindTransforms.setRightNodeCountByRefs(board, refs);
            const deletableElements = getFirstLevelElement(targetMindElements);
            data.push(...deletableElements);

            const nextSelected = getNextSelectedElement(board, firstLevelElements);
            if (nextSelected) {
                addSelectedElement(board, nextSelected);
            }
        }
        return getDeletedFragment(data);
    };

    board.setFragment = async (data: DataTransfer | null, rectangle: RectangleClient | null, type: 'copy' | 'cut') => {
        const targetMindElements = getSelectedMindElements(board);
        const firstLevelElements = getFirstLevelElement(targetMindElements);
        if (firstLevelElements.length) {
            const elements = buildClipboardData(board, firstLevelElements, rectangle ? [rectangle.x, rectangle.y] : [0, 0]);
            await setPlaitClipboardData(elements);
        }
        setFragment(data, rectangle, type);
    };

    board.insertFragment = async (clipboardData: DataTransfer | null, targetPoint: Point) => {
        const pasteData = clipboardData ? await getClipboardDataByNative(clipboardData) : await geClipboardDataByClipboardApi();
        if (!pasteData || !pasteData?.value.length) {
            return;
        }
        if (pasteData.type === 'plait') {
            const elements = pasteData.value as PlaitElement[];
            const mindElements = elements.filter(value => MindElement.isMindElement(board, value));
            if (mindElements.length) {
                insertClipboardData(board, mindElements, targetPoint);
            }
        }
        insertFragment(clipboardData, targetPoint);
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
