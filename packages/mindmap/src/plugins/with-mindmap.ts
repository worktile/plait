import {
    addSelectedElement,
    ELEMENT_TO_PLUGIN_COMPONENT,
    getSelectedElements,
    hotkeys,
    IS_TEXT_EDITABLE,
    Path,
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
    Range
} from '@plait/core';
import { getSizeByText } from '@plait/richtext';
import { MindmapNodeElement, PlaitMindmap } from '../interfaces';
import { MindmapNode } from '../interfaces/node';
import { PlaitMindmapComponent } from '../mindmap.component';
import {
    changeRightNodeCount,
    createEmptyNode,
    deleteSelectedELements,
    filterChildElement,
    findParentElement,
    findPath,
    shouldChangeRightNodeCount
} from '../utils';
import { getRectangleByNode, hitMindmapNode } from '../utils/graph';
import { isVirtualKey } from '../utils/is-virtual-key';
import { MINDMAP_ELEMENT_TO_COMPONENT } from '../utils/weak-maps';
import { withNodeDnd } from './with-dnd';
import { buildClipboardData, getDataFromClipboard, insertClipboardData, insertClipboardText, setClipboardData } from '../utils/clipboard';
import { AbstractNode } from '@plait/layouts';

export const withMindmap: PlaitPlugin = (board: PlaitBoard) => {
    const { drawElement, dblclick, keydown, insertFragment, setFragment, deleteFragment, isHitSelection, getRectangle, isMovable } = board;

    board.drawElement = (context: PlaitPluginElementContext) => {
        if (PlaitMindmap.isPlaitMindmap(context.element)) {
            return PlaitMindmapComponent;
        }
        return drawElement(context);
    };

    board.getRectangle = element => {
        const mindmapElement = MINDMAP_ELEMENT_TO_COMPONENT.get(element as MindmapNodeElement);
        if (mindmapElement) {
            return getRectangleByNode(mindmapElement.node);
        }
        return getRectangle(element);
    };

    board.isHitSelection = (element, range: Range) => {
        const nodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(element as MindmapNodeElement);
        if (nodeComponent && board.selection) {
            const target = getRectangleByNode(nodeComponent.node);
            return RectangleClient.isIntersect(RectangleClient.toRectangleClient([range.anchor, range.focus]), target);
        }

        return isHitSelection(element, range);
    };

    board.isMovable = element => {
        if (PlaitMindmap.isPlaitMindmap(element) && element.isRoot) {
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
            if ((event.key === 'Tab' || (event.key === 'Enter' && !selectedElements[0].isRoot && !AbstractNode.isAbstract(selectedElements[0]))) && selectedElements.length === 1) {
                event.preventDefault();
                const selectedElement = selectedElements[0];
                removeSelectedElement(board, selectedElement);
                const mindmapNodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(selectedElement);
                if (event.key === 'Tab') {
                    if (mindmapNodeComponent) {
                        const isCollapsed = mindmapNodeComponent.node.origin.isCollapsed;
                        const path = findPath(board, mindmapNodeComponent.node).concat(mindmapNodeComponent.node.origin.children.length);
                        if (isCollapsed) {
                            const newElement: Partial<MindmapNodeElement> = { isCollapsed: false };
                            const boardPath = findPath(board, mindmapNodeComponent.node);
                            PlaitHistoryBoard.withoutSaving(board, () => {
                                Transforms.setNode(board, newElement, boardPath);
                            });
                        }
                        createEmptyNode(board, mindmapNodeComponent.node.origin, path);
                    }
                } else {
                    if (mindmapNodeComponent) {
                        const path = Path.next(findPath(board, mindmapNodeComponent.node));
                        const parentPath: Path = mindmapNodeComponent.parent ? findPath(board, mindmapNodeComponent!.parent) : [];
                        if (shouldChangeRightNodeCount(selectedElement)) {
                            changeRightNodeCount(board, parentPath, 1);
                        }

                        createEmptyNode(board, mindmapNodeComponent.parent.origin, path);
                    }
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

                if (selectedElements.length && isSameParent) {
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
                const mindmapNodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(selectedElement);
                const isSpaceKey = event.code === 'Space';
                const isClear = isSpaceKey ? false : true;
                mindmapNodeComponent?.startEditText(isSpaceKey, isClear);
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
        let startEdit = false;
        board.children.forEach((value: PlaitElement) => {
            if (PlaitMindmap.isPlaitMindmap(value)) {
                const mindmapComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(value) as PlaitMindmapComponent;
                const root = mindmapComponent?.root;
                (root as any).eachNode((node: MindmapNode) => {
                    if (startEdit) {
                        return;
                    }
                    if (hitMindmapNode(board, point, node)) {
                        const nodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(node.origin);
                        if (nodeComponent) {
                            nodeComponent.startEditText(false, false);
                            startEdit = true;
                        }
                    }
                });
            }
        });
        if (startEdit) {
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
                insertClipboardText(board, text, width);
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
