import {
    ClipboardData,
    Path,
    PlaitBoard,
    PlaitElement,
    PlaitNode,
    Point,
    RectangleClient,
    WritableClipboardContext,
    WritableClipboardOperationType,
    WritableClipboardType,
    addClipboardContext,
    addSelectedElement,
    createClipboardContext
} from '@plait/core';
import { MindElement } from '../interfaces';
import { AbstractNode } from '@plait/layouts';
import { getFirstLevelElement } from '../utils/mind';
import { deleteElementsHandleRightNodeCount } from '../utils/node/right-node-count';
import { MindTransforms } from '../transforms';
import { deleteElementHandleAbstract } from '../utils/abstract/common';
import { getSelectedMindElements } from '../utils/node/common';
import { PlaitMindBoard } from './with-mind.board';
import { buildClipboardData, insertClipboardData, insertClipboardText } from '../utils/clipboard';
import { buildText, getElementsText } from '@plait/common';

export const withMindFragment = (baseBoard: PlaitBoard) => {
    const board = baseBoard as PlaitBoard & PlaitMindBoard;
    let firstLevelElements: MindElement[] | null;
    const { getDeletedFragment, insertFragment, buildFragment, deleteFragment } = board;

    board.getDeletedFragment = (data: PlaitElement[]) => {
        const targetMindElements = getSelectedMindElements(board);
        if (targetMindElements.length) {
            firstLevelElements = getFirstLevelElement(targetMindElements).reverse();
            const abstractRefs = deleteElementHandleAbstract(board, firstLevelElements);
            MindTransforms.setAbstractsByRefs(board, abstractRefs);
            const refs = deleteElementsHandleRightNodeCount(board, targetMindElements);
            MindTransforms.setRightNodeCountByRefs(board, refs);
            const deletableElements = getFirstLevelElement(targetMindElements);
            data.push(...deletableElements);
        }
        return getDeletedFragment(data);
    };

    board.deleteFragment = (elements: PlaitElement[]) => {
        deleteFragment(elements);
        if (firstLevelElements) {
            const nextSelected = getNextSelectedElement(board, firstLevelElements);
            if (nextSelected) {
                addSelectedElement(board, nextSelected);
            }
            firstLevelElements = null;
        }
    };

    board.buildFragment = (
        clipboardContext: WritableClipboardContext | null,
        rectangle: RectangleClient | null,
        operationType: WritableClipboardOperationType,
        originData?: PlaitElement[]
    ) => {
        const targetMindElements = getSelectedMindElements(board, originData);
        const firstLevelElements = getFirstLevelElement(targetMindElements);
        if (firstLevelElements.length) {
            const elements = buildClipboardData(board, firstLevelElements, rectangle ? [rectangle.x, rectangle.y] : [0, 0]);
            const text = getElementsText(targetMindElements);
            if (!clipboardContext) {
                clipboardContext = createClipboardContext(WritableClipboardType.elements, elements, text);
            } else {
                clipboardContext = addClipboardContext(clipboardContext, {
                    text,
                    type: WritableClipboardType.elements,
                    elements
                });
            }
        }
        return buildFragment(clipboardContext, rectangle, operationType, originData);
    };

    board.insertFragment = (clipboardData: ClipboardData | null, targetPoint: Point, operationType?: WritableClipboardOperationType) => {
        if (clipboardData?.elements?.length) {
            const mindElements = clipboardData.elements?.filter(value => MindElement.isMindElement(board, value));
            if (mindElements && mindElements.length > 0) {
                insertClipboardData(board, mindElements, targetPoint, operationType);
            }
        }
        if (clipboardData?.text) {
            const mindElements = getSelectedMindElements(board);
            if (mindElements.length === 1) {
                insertClipboardText(board, mindElements[0], buildText(clipboardData.text));
                return;
            }
        }

        insertFragment(clipboardData, targetPoint, operationType);
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
