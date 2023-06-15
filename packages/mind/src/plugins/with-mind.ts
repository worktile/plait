import {
    addSelectedElement,
    getSelectedElements,
    hotkeys,
    PlaitBoard,
    PlaitHistoryBoard,
    PlaitPluginElementContext,
    Point,
    RectangleClient,
    removeSelectedElement,
    toPoint,
    transformPoint,
    Transforms,
    Range,
    depthFirstRecursion,
    Path,
    PlaitElement
} from '@plait/core';
import { getSizeByText } from '@plait/text';
import { MindElement, PlaitMind } from '../interfaces';
import { PlaitMindComponent } from '../mind.component';
import { MindNodeComponent } from '../node.component';
import {
    insertMindElement,
    getFirstLevelElement,
    isInRightBranchOfStandardLayout,
    insertElementHandleAbstract,
    deleteElementHandleAbstract,
    insertElementHandleRightNodeCount,
    deleteElementsHandleRightNodeCount
} from '../utils';
import { getRectangleByNode, isHitMindElement } from '../utils/position/node';
import { isVirtualKey } from '../utils/is-virtual-key';
import { withNodeDnd } from './with-node-dnd';
import { buildClipboardData, getDataFromClipboard, insertClipboardData, insertClipboardText, setClipboardData } from '../utils/clipboard';
import { AbstractNode } from '@plait/layouts';
import { findNewChildNodePath, findNewSiblingNodePath } from '../utils/path';
import { editTopic } from '../utils/node/common';
import { withAbstract } from './with-abstract-resize';
import { withMindExtend } from './with-mind-extend';
import { TOPIC_DEFAULT_MAX_WORD_COUNT } from '../constants/node-topic-style';
import { MindTransforms } from '../transforms';
import { withCreateMind } from './with-mind-create';
import { DefaultAbstractNodeStyle } from '../constants/node-style';
import { withMindHotkey } from './with-mind-hotkey';
import { withNodeHover } from './with-node-hover';

export const withMind = (board: PlaitBoard) => {
    const {
        drawElement,
        dblclick,
        keydown,
        insertFragment,
        setFragment,
        deleteFragment,
        isHitSelection,
        getRectangle,
        isMovable,
        isRecursion
    } = board;

    board.drawElement = (context: PlaitPluginElementContext) => {
        if (PlaitMind.isMind(context.element)) {
            return PlaitMindComponent;
        } else if (MindElement.isMindElement(board, context.element)) {
            return MindNodeComponent;
        }
        return drawElement(context);
    };

    board.applyTheme = (element: PlaitElement) => {
        const mindElement = element as MindElement;
        const shouldClearProperty =
            !PlaitBoard.isBoard(element) && (mindElement?.branchColor || mindElement?.fill || mindElement?.strokeColor);
        const isAbstract = AbstractNode.isAbstract(element);
        if (shouldClearProperty) {
            const path = PlaitBoard.findPath(board, element);

            if (isAbstract) {
                Transforms.setNode(
                    board,
                    { fill: null, strokeColor: DefaultAbstractNodeStyle.strokeColor, branchColor: DefaultAbstractNodeStyle.branchColor },
                    path
                );
            } else {
                Transforms.setNode(board, { fill: null, strokeColor: null, branchColor: null }, path);
            }
        }
    };

    board.getRectangle = element => {
        if (MindElement.isMindElement(board, element)) {
            return getRectangleByNode(MindElement.getNode(element));
        }
        return getRectangle(element);
    };

    board.isRecursion = element => {
        if (MindElement.isMindElement(board, element) && element.isCollapsed) {
            return false;
        }
        return isRecursion(element);
    };

    board.isHitSelection = (element, range: Range) => {
        if (MindElement.isMindElement(board, element)) {
            const client = getRectangleByNode(MindElement.getNode(element));
            const isHit = RectangleClient.isHit(RectangleClient.toRectangleClient([range.anchor, range.focus]), client);
            return isHit;
        }
        return isHitSelection(element, range);
    };

    board.isMovable = element => {
        if (PlaitMind.isMind(element) && element.isRoot) {
            return true;
        }
        return isMovable(element);
    };

    board.keydown = (event: KeyboardEvent) => {
        if (PlaitBoard.isReadonly(board)) {
            keydown(event);
            return;
        }
        const selectedElements = getSelectedElements(board) as MindElement[];
        if (selectedElements.length) {
            if (
                selectedElements.length === 1 &&
                (event.key === 'Tab' ||
                    (event.key === 'Enter' && !selectedElements[0].isRoot && !AbstractNode.isAbstract(selectedElements[0])))
            ) {
                event.preventDefault();
                const selectedElement = selectedElements[0];
                removeSelectedElement(board, selectedElement);
                const selectedElementPath = PlaitBoard.findPath(board, selectedElement);
                if (event.key === 'Tab') {
                    if (selectedElement.isCollapsed) {
                        const newElement: Partial<MindElement> = { isCollapsed: false };
                        PlaitHistoryBoard.withoutSaving(board, () => {
                            Transforms.setNode(board, newElement, selectedElementPath);
                        });
                    }
                    insertMindElement(board, selectedElement, findNewChildNodePath(board, selectedElement));
                } else {
                    if (isInRightBranchOfStandardLayout(selectedElement)) {
                        const refs = insertElementHandleRightNodeCount(board, selectedElementPath.slice(0, 1), 1);
                        MindTransforms.setRightNodeCountByRefs(board, refs);
                    }

                    const abstractRefs = insertElementHandleAbstract(board, Path.next(selectedElementPath));
                    MindTransforms.setAbstractsByRefs(board, abstractRefs);

                    insertMindElement(board, selectedElement, findNewSiblingNodePath(board, selectedElement));
                }
                return;
            }
            if (hotkeys.isDeleteBackward(event) || hotkeys.isDeleteForward(event)) {
                event.preventDefault();
                const deletableElements = getFirstLevelElement(selectedElements).reverse();
                const abstractRefs = deleteElementHandleAbstract(board, deletableElements);
                MindTransforms.setAbstractsByRefs(board, abstractRefs);

                const refs = deleteElementsHandleRightNodeCount(board, selectedElements);
                MindTransforms.setRightNodeCountByRefs(board, refs);

                MindTransforms.removeElements(board, selectedElements);

                let activeElement: MindElement | undefined;
                const firstLevelElements = getFirstLevelElement(selectedElements);

                if (AbstractNode.isAbstract(firstLevelElements[0])) {
                    const parent = MindElement.getParent(firstLevelElements[0]);
                    activeElement = parent.children[firstLevelElements[0].start];
                }

                const firstElement = firstLevelElements[0];
                const firstElementParent = MindElement.findParent(firstElement);
                const hasSameParent = firstLevelElements.every(element => {
                    return MindElement.findParent(element) === firstElementParent;
                });
                if (firstElementParent && hasSameParent && !activeElement) {
                    const firstElementIndex = firstElementParent.children.indexOf(firstElement);
                    const childrenCount = firstElementParent.children.length;
                    // active parent element
                    if (childrenCount === firstLevelElements.length) {
                        activeElement = firstElementParent;
                    } else {
                        if (firstElementIndex > 0) {
                            activeElement = firstElementParent.children[firstElementIndex - 1];
                        }
                    }
                }
                if (activeElement) {
                    addSelectedElement(board, activeElement);
                }
                return;
            }
            // auto enter edit status
            if (!isVirtualKey(event)) {
                event.preventDefault();
                const selectedElement = selectedElements[0];
                editTopic(selectedElement);
                return;
            }
        }

        if (board.selection && event.code === 'Space') {
            if (selectedElements?.length) {
                return;
            }
        }

        keydown(event);
    };

    board.dblclick = (event: MouseEvent) => {
        if (PlaitBoard.isReadonly(board)) {
            dblclick(event);
            return;
        }
        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        board.children
            .filter(value => PlaitMind.isMind(value))
            .forEach(mindMap => {
                depthFirstRecursion<MindElement>(
                    mindMap as MindElement,
                    node => {
                        if (!PlaitBoard.hasBeenTextEditing(board) && isHitMindElement(board, point, node)) {
                            editTopic(node);
                        }
                    },
                    node => {
                        if (PlaitBoard.isBoard(node) || board.isRecursion(node)) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                );
            });
        if (PlaitBoard.hasBeenTextEditing(board)) {
            return;
        }
        dblclick(event);
    };

    board.setFragment = (data: DataTransfer | null) => {
        const selectedElements = getFirstLevelElement(getSelectedElements(board) as MindElement[]);
        if (selectedElements.length) {
            const elements = buildClipboardData(board, selectedElements);
            setClipboardData(data, elements);
            return;
        }
        setFragment(data);
    };

    board.insertFragment = (data: DataTransfer | null, targetPoint?: Point) => {
        if (board.options.readonly) {
            insertFragment(data, targetPoint);
            return;
        }

        const elements = getDataFromClipboard(data);
        if (elements.length) {
            insertClipboardData(board, elements, targetPoint || [0, 0]);
        } else {
            const text = data?.getData(`text/plain`) as string;
            const { width, height } = getSizeByText(
                text,
                PlaitBoard.getHost(board).parentElement as HTMLElement,
                TOPIC_DEFAULT_MAX_WORD_COUNT
            );
            const selectedElements = getSelectedElements(board);
            if (text && selectedElements.length === 1) {
                insertClipboardText(board, selectedElements[0], text, width, height);
            }
        }
        insertFragment(data, targetPoint);
    };

    board.deleteFragment = (data: DataTransfer | null) => {
        const selectedElements = getSelectedElements(board) as MindElement[];
        const deletableElements = getFirstLevelElement(selectedElements).reverse();
        const abstractRefs = deleteElementHandleAbstract(board, deletableElements);
        MindTransforms.setAbstractsByRefs(board, abstractRefs);

        const refs = deleteElementsHandleRightNodeCount(board, selectedElements);
        MindTransforms.setRightNodeCountByRefs(board, refs);

        MindTransforms.removeElements(board, selectedElements);
        deleteFragment(data);
    };

    return withNodeHover(withMindHotkey(withMindExtend(withCreateMind(withAbstract(withNodeDnd(board))))));
};
