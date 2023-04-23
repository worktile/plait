import {
    addSelectedElement,
    ELEMENT_TO_PLUGIN_COMPONENT,
    getSelectedElements,
    hotkeys,
    IS_TEXT_EDITABLE,
    PlaitBoard,
    PlaitElement,
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
    depthFirstRecursion
} from '@plait/core';
import { getSizeByText } from '@plait/richtext';
import { MindmapNodeElement, PlaitMindmap } from '../interfaces';
import { MindmapNode } from '../interfaces/node';
import { PlaitMindmapComponent } from '../mindmap.component';
import { MindmapNodeComponent } from '../node.component';
import {
    changeRightNodeCount,
    createEmptyNode,
    deleteSelectedELements,
    filterChildElement,
    findParentElement,
    shouldChangeRightNodeCount
} from '../utils';
import { getRectangleByNode, hitMindmapElement } from '../utils/graph';
import { isVirtualKey } from '../utils/is-virtual-key';
import { ELEMENT_TO_NODE, MINDMAP_ELEMENT_TO_COMPONENT } from '../utils/weak-maps';
import { withNodeDnd } from './with-dnd';
import { buildClipboardData, getDataFromClipboard, insertClipboardData, insertClipboardText, setClipboardData } from '../utils/clipboard';
import { findNewChildNodePath, findNewSiblingNodePath } from '../utils/path';
import { enterNodeEditing } from '../utils/node';

export const withMindmap: PlaitPlugin = (board: PlaitBoard) => {
    const { drawElement, dblclick, keydown, insertFragment, setFragment, deleteFragment, isHitSelection, getRectangle, isMovable } = board;

    board.drawElement = (context: PlaitPluginElementContext) => {
        if (PlaitMindmap.isMindmap(context.element)) {
            return PlaitMindmapComponent;
        } else if (MindmapNodeElement.isMindmapNodeElement(board, context.element)) {
            return MindmapNodeComponent;
        }
        return drawElement(context);
    };

    board.getRectangle = element => {
        if (MindmapNodeElement.isMindmapNodeElement(board, element)) {
            return getRectangleByNode(MindmapNodeElement.getNode(board, element));
        }
        return getRectangle(element);
    };

    board.isHitSelection = (element, range: Range) => {
        if (MindmapNodeElement.isMindmapNodeElement(board, element) && board.selection) {
            const client = getRectangleByNode(MindmapNodeElement.getNode(board, element));;
            return RectangleClient.isIntersect(RectangleClient.toRectangleClient([range.anchor, range.focus]), client);
        }
        return isHitSelection(element, range);
    };

    board.isMovable = element => {
        if (PlaitMindmap.isMindmap(element) && element.isRoot) {
            return true;
        }
        return isMovable(element);
    };

    board.keydown = (event: KeyboardEvent) => {
        if (board.options.readonly || IS_TEXT_EDITABLE.get(board)) {
            keydown(event);
            return;
        }
        const selectedElements = getSelectedElements(board) as MindmapNodeElement[];
        if (selectedElements.length) {
            if (selectedElements.length === 1 && (event.key === 'Tab' || (event.key === 'Enter' && !selectedElements[0].isRoot))) {
                event.preventDefault();
                const selectedElement = selectedElements[0];
                removeSelectedElement(board, selectedElement);
                const selectedElementPath = PlaitBoard.findPath(board, selectedElement);
                if (event.key === 'Tab') {
                    const isCollapsed = selectedElement.isCollapsed;
                    if (isCollapsed) {
                        const newElement: Partial<MindmapNodeElement> = { isCollapsed: false };
                        PlaitHistoryBoard.withoutSaving(board, () => {
                            Transforms.setNode(board, newElement, selectedElementPath);
                        });
                    }
                    createEmptyNode(board, selectedElement, findNewChildNodePath(board, selectedElement));
                } else {
                    if (shouldChangeRightNodeCount(selectedElement)) {
                        changeRightNodeCount(board, selectedElementPath.slice(0, 1), 1);
                    }
                    createEmptyNode(board, selectedElement, findNewSiblingNodePath(board, selectedElement));
                }
                return;
            }
            if (hotkeys.isDeleteBackward(event) || hotkeys.isDeleteForward(event)) {
                event.preventDefault();
                deleteSelectedELements(board, selectedElements);

                let lastNode: MindmapNode | any = null;
                const elementGroup = filterChildElement(selectedElements);
                const selectNode = elementGroup[0];
                const mindmapNodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(selectNode);
                const nodeIndex = mindmapNodeComponent?.parent?.children.findIndex(item => item.origin.id === selectNode.id);
                const isSameParent = elementGroup.every(element => {
                    return findParentElement(element) && findParentElement(elementGroup[0]) === findParentElement(element);
                });
                if (isSameParent) {
                    const childCount = mindmapNodeComponent!.parent?.children.length - elementGroup.length;
                    if (childCount === 0) {
                        lastNode = mindmapNodeComponent?.parent;
                    } else if (nodeIndex === 0) {
                        lastNode = mindmapNodeComponent?.parent.children[elementGroup.length];
                    } else if (nodeIndex! > 0) {
                        lastNode = mindmapNodeComponent?.parent.children[nodeIndex! - 1];
                    }
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
            .filter(value => PlaitMindmap.isMindmap(value))
            .forEach(mindmap => {
                depthFirstRecursion<MindmapNodeElement>(mindmap as MindmapNodeElement, node => {
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
        const selectedElements = filterChildElement(getSelectedElements(board) as MindmapNodeElement[]);

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
            const { width } = getSizeByText(text, PlaitBoard.getHost(board).parentElement as HTMLElement);
            const selectedElements = getSelectedElements(board);
            if (text && selectedElements.length === 1) {
                insertClipboardText(board, selectedElements[0], text, width);
            }
        }
        insertFragment(data, targetPoint);
    };

    board.deleteFragment = (data: DataTransfer | null) => {
        const selectedElements = getSelectedElements(board) as MindmapNodeElement[];
        deleteSelectedELements(board, selectedElements);
        deleteFragment(data);
    };

    return withNodeDnd(board);
};
