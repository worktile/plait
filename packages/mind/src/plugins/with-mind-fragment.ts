import {
    ClipboardData,
    Path,
    PlaitBoard,
    PlaitElement,
    PlaitNode,
    Point,
    RectangleClient,
    WritableClipboardContext,
    WritableClipboardType,
    addClipboardContext,
    addSelectedElement,
    createClipboardContext
} from '@plait/core';
import { MindElement } from '../interfaces';
import { AbstractNode } from '@plait/layouts';
import { extractNodesText, getFirstLevelElement } from '../utils/mind';
import { deleteElementsHandleRightNodeCount } from '../utils/node/right-node-count';
import { MindTransforms } from '../transforms';
import { deleteElementHandleAbstract } from '../utils/abstract/common';
import { getSelectedMindElements } from '../utils/node/common';
import { PlaitMindBoard } from './with-mind.board';
import { buildClipboardData, insertClipboardData, insertClipboardText } from '../utils/clipboard';
import { buildText } from '@plait/text';

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

    board.setFragment = (
        data: DataTransfer | null,
        clipboardContext: WritableClipboardContext | null,
        rectangle: RectangleClient | null,
        type: 'copy' | 'cut'
    ) => {
        const targetMindElements = getSelectedMindElements(board);
        const firstLevelElements = getFirstLevelElement(targetMindElements);
        if (firstLevelElements.length) {
            const elements = buildClipboardData(board, firstLevelElements, rectangle ? [rectangle.x, rectangle.y] : [0, 0]);
            const text = elements.reduce((string, currentNode) => {
                return string + extractNodesText(currentNode);
            }, '');

            if (!clipboardContext) {
                clipboardContext = createClipboardContext(WritableClipboardType.elements, elements, text);
            } else {
                clipboardContext = addClipboardContext(clipboardContext, {
                    text,
                    type: WritableClipboardType.elements,
                    data: elements
                });
            }
        }
        setFragment(data, clipboardContext, rectangle, type);
    };

    board.insertFragment = (data: DataTransfer | null, clipboardData: ClipboardData | null, targetPoint: Point) => {
        if (clipboardData?.elements) {
            const mindElements = clipboardData.elements?.filter(value => MindElement.isMindElement(board, value));
            if (mindElements && mindElements.length > 0) {
                insertClipboardData(board, mindElements, targetPoint);
            }
        }
        if (clipboardData?.text) {
            const mindElements = getSelectedMindElements(board);
            if (mindElements.length === 1) {
                insertClipboardText(board, mindElements[0], buildText(clipboardData?.text));
            }
        }

        insertFragment(data, clipboardData, targetPoint);
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
