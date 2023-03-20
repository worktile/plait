import {
    addSelectedElement,
    ELEMENT_TO_PLUGIN_COMPONENT,
    getSelectedElements,
    hotkeys,
    idCreator,
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
    Transforms
} from '@plait/core';
import { getWidthByText } from '@plait/richtext';
import { MindmapNodeElement, PlaitMindmap } from '../interfaces';
import { MindmapNode } from '../interfaces/node';
import { PlaitMindmapComponent } from '../mindmap.component';
import { changeRightNodeCount, createEmptyNode, filterChildElement, findPath } from '../utils';
import { getRectangleByNode, hitMindmapNode } from '../utils/graph';
import { isVirtualKey } from '../utils/is-virtual-key';
import { MINDMAP_ELEMENT_TO_COMPONENT } from '../utils/weak-maps';
import { withNodeDnd } from './with-dnd';
import { buildClipboardData, getDataFromClipboard, insertClipboardData, setClipboardData } from '../utils/clipboard';

export const withMindmap: PlaitPlugin = (board: PlaitBoard) => {
    const { drawElement, dblclick, keydown, insertFragment, setFragment, deleteFragment, isIntersectionSelection } = board;

    board.drawElement = (context: PlaitPluginElementContext) => {
        if (PlaitMindmap.isPlaitMindmap(context.element)) {
            return PlaitMindmapComponent;
        }
        return drawElement(context);
    };

    board.isIntersectionSelection = element => {
        const nodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(element as MindmapNodeElement);
        if (nodeComponent && board.selection) {
            const target = getRectangleByNode(nodeComponent.node);
            return RectangleClient.isIntersect(RectangleClient.toRectangleClient([board.selection.anchor, board.selection.focus]), target);
        }
        return isIntersectionSelection(element);
    };

    board.keydown = (event: KeyboardEvent) => {
        if (board.options.readonly || IS_TEXT_EDITABLE.get(board)) {
            keydown(event);
            return;
        }
        const selectedElements = getSelectedElements(board) as MindmapNodeElement[];
        if (selectedElements && selectedElements.length === 1) {
            if (event.key === 'Tab' || (event.key === 'Enter' && !selectedElements[0].isRoot)) {
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
                        changeRightNodeCount(board, selectedElement, 1);
                        createEmptyNode(board, mindmapNodeComponent.parent.origin, path);
                    }
                }
                return;
            }

            if (hotkeys.isDeleteBackward(event) || hotkeys.isDeleteForward(event)) {
                event.preventDefault();
                if (PlaitMindmap.isPlaitMindmap(selectedElements[0]) && board.children.length === 1 && !board.options.allowClearBoard) {
                    keydown(event);
                    return;
                }
                selectedElements.forEach(node => {
                    const mindmapNodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(node);
                    if (mindmapNodeComponent) {
                        const path = findPath(board, mindmapNodeComponent.node);
                        changeRightNodeCount(board, selectedElements[0], -1);
                        Transforms.removeNode(board, path);
                    }
                });
                if (selectedElements.length === 1) {
                    let lastNode: MindmapNode | any = null;
                    const selectNode = selectedElements[0];
                    const mindmapNodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(selectNode);
                    if (mindmapNodeComponent?.parent?.children) {
                        const nodeIndex: number = mindmapNodeComponent?.parent.children.findIndex(item => item.origin.id === selectNode.id);
                        if (mindmapNodeComponent?.parent.children[nodeIndex - 1]) {
                            lastNode = mindmapNodeComponent?.parent.children[nodeIndex - 1];
                        } else if (mindmapNodeComponent?.parent.children[nodeIndex + 1]) {
                            lastNode = mindmapNodeComponent?.parent.children[nodeIndex + 1];
                        } else {
                            lastNode = mindmapNodeComponent?.parent;
                        }
                    }
                    if (lastNode) {
                        addSelectedElement(board, lastNode.origin);
                    }
                }
                return;
            }

            // auto enter edit status
            if (!isVirtualKey(event)) {
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
        const point = transformPoint(board, toPoint(event.x, event.y, board.host));
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
        const selectedNodes = filterChildElement(getSelectedElements(board));

        if (selectedNodes.length) {
            const nodeData = buildClipboardData(selectedNodes);
            setClipboardData(data, nodeData);
            return;
        }
        setFragment(data);
    };

    board.insertFragment = (data: DataTransfer | null, targetPoint?: Point) => {
        if (board.options.readonly) {
            insertFragment(data, targetPoint);
            return;
        }

        const nodesData = getDataFromClipboard(data);
        if (nodesData.length) {
            insertClipboardData(board, nodesData, targetPoint || [0, 0]);
        } else {
            const text = data?.getData(`text/plain`) as string;
            const textWidth = getWidthByText(text, board.host.parentElement as HTMLElement);
            if (text) {
                const newElement = {
                    id: idCreator(),
                    value: {
                        children: [{ text }]
                    },
                    children: [],
                    width: textWidth,
                    height: 24
                };
                const element = getSelectedElements(board)?.[0];
                const nodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(element as MindmapNodeElement);
                if (nodeComponent) {
                    const path = findPath(board, nodeComponent.node).concat(nodeComponent.node.children.length);
                    Transforms.insertNode(board, newElement, path);
                    return;
                }
            }
        }
        insertFragment(data, targetPoint);
    };

    board.deleteFragment = (data: DataTransfer | null) => {
        const selectedNode = getSelectedElements(board)?.[0];
        if (selectedNode && !board.options.readonly) {
            const nodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(selectedNode as MindmapNodeElement);
            if (nodeComponent) {
                const path = findPath(board, nodeComponent.node);
                Transforms.removeNode(board, path);
                return;
            }
        }
        deleteFragment(data);
    };

    return withNodeDnd(board);
};
