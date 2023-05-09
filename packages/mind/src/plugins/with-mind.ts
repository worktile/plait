import {
    addSelectedElement,
    getSelectedElements,
    hotkeys,
    IS_TEXT_EDITABLE,
    PlaitBoard,
    PlaitHistoryBoard,
    PlaitPlugin,
    PlaitPluginElementContext,
    Point,
    RectangleClient,
    removeSelectedElement,
    toPoint,
    transformPoint,
    Transforms,
    Range,
    depthFirstRecursion,
    PlaitElement
} from '@plait/core';
import { getSizeByText } from '@plait/richtext';
import { MindElement, PlaitMind } from '../interfaces';
import { MindmapNode } from '../interfaces/node';
import { PlaitMindComponent } from '../mind.component';
import { MindNodeComponent } from '../node.component';
import {
    changeRightNodeCount,
    insertMindElement,
    deleteSelectedELements,
    filterChildElement,
    findParentElement,
    shouldChangeRightNodeCount
} from '../utils';
import { getRectangleByNode, hitMindmapElement } from '../utils/graph';
import { isVirtualKey } from '../utils/is-virtual-key';
import { MINDMAP_ELEMENT_TO_COMPONENT } from '../utils/weak-maps';
import { withDnd } from './with-dnd';
import { buildClipboardData, getDataFromClipboard, insertClipboardData, insertClipboardText, setClipboardData } from '../utils/clipboard';
import { AbstractNode } from '@plait/layouts';
import { findNewChildNodePath, findNewSiblingNodePath } from '../utils/path';
import { enterNodeEditing } from '../utils/node';
import { withEmoji } from './emoji/with-mind-emoji';
import { TOPIC_DEFAULT_MAX_WORD_COUNT } from '../constants';
import { withAbstract } from './with-abstract';

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
        if (MindElement.isMindElement(board, element) && board.selection) {
            const client = getRectangleByNode(MindElement.getNode(element));
            return RectangleClient.isHit(RectangleClient.toRectangleClient([range.anchor, range.focus]), client);
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
        if (board.options.readonly || IS_TEXT_EDITABLE.get(board)) {
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
                    if (shouldChangeRightNodeCount(selectedElement)) {
                        changeRightNodeCount(board, selectedElementPath.slice(0, 1), 1);
                    }
                    insertMindElement(board, selectedElement, findNewSiblingNodePath(board, selectedElement));
                }
                return;
            }
            if (hotkeys.isDeleteBackward(event) || hotkeys.isDeleteForward(event)) {
                event.preventDefault();
                deleteSelectedELements(board, selectedElements);

                let lastNode: MindmapNode | any = null;
                const firstLevelElements = filterChildElement(selectedElements);
                const firstElement = firstLevelElements[0];
                const firstComponent = PlaitElement.getComponent(firstElement) as MindNodeComponent;
                const nodeIndex = firstComponent?.parent?.children.findIndex(item => item.origin.id === firstElement.id);
                const isSameParent = firstLevelElements.every(element => {
                    return findParentElement(element) && findParentElement(firstLevelElements[0]) === findParentElement(element);
                });
                if (isSameParent) {
                    const childCount = firstComponent!.parent?.children.length - firstLevelElements.length;
                    if (childCount === 0) {
                        lastNode = firstComponent?.parent;
                    } else if (nodeIndex === 0) {
                        lastNode = firstComponent?.parent.children[firstLevelElements.length];
                    } else if (nodeIndex! > 0) {
                        lastNode = firstComponent?.parent.children[nodeIndex! - 1];
                    }
                }

                if (elementGroup.length === 1 && AbstractNode.isAbstract(selectNode)) {
                    lastNode = MindNodeComponent?.parent.children[selectNode.start];
                }

                if (lastNode) {
                    addSelectedElement(board, lastNode.origin);
                }
                return;
            }
            // auto enter edit status
            if (!isVirtualKey(event)) {
                event.preventDefault();
                const selectedElement = selectedElements[0];
                enterNodeEditing(selectedElement);
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
        if (board.options.readonly || IS_TEXT_EDITABLE.get(board)) {
            dblclick(event);
            return;
        }
        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        board.children
            .filter(value => PlaitMind.isMind(value))
            .forEach(mindmap => {
                depthFirstRecursion<MindElement>(mindmap as MindElement, node => {
                    if (!PlaitBoard.hasBeenTextEditing(board) && hitMindmapElement(board, point, node)) {
                        enterNodeEditing(node);
                    }
                });
            });
        if (PlaitBoard.hasBeenTextEditing(board)) {
            return;
        }
        dblclick(event);
    };

    board.setFragment = (data: DataTransfer | null) => {
        const selectedElements = filterChildElement(getSelectedElements(board) as MindElement[]);

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
        deleteSelectedELements(board, selectedElements);
        deleteFragment(data);
    };

    return withEmoji(withAbstract(withDnd(board)));
};
