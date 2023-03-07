import { SimpleChanges, ViewContainerRef } from '@angular/core';
import {
    CLIP_BOARD_FORMAT_KEY,
    ELEMENT_TO_PLUGIN_COMPONENT,
    hotkeys,
    idCreator,
    isNoSelectionElement,
    IS_TEXT_EDITABLE,
    Path,
    PlaitBoard,
    PlaitElement,
    PlaitHistoryBoard,
    PlaitPlugin,
    PlaitPluginElementContext,
    RectangleClient,
    toPoint,
    transformPoint,
    Transforms,
    Selection
} from '@plait/core';
import { getWidthByText } from '@plait/richtext';
import { MindmapNodeElement, PlaitMindmap } from '../interfaces';
import { MindmapNode } from '../interfaces/node';
import { PlaitMindmapComponent } from '../mindmap.component';
import { buildNodes, changeRightNodeCount, createEmptyNode, extractNodesText, findPath } from '../utils';
import { getRectangleByNode, hitMindmapNode, toRectangleClient } from '../utils/graph';
import { isVirtualKey } from '../utils/is-virtual-key';
import {
    addSelectedMindmapElements,
    clearAllSelectedMindmapElements,
    deleteSelectedMindmapElements,
    getSelectedMindmapElements,
    hasSelectedMindmapElement
} from '../utils/selected-elements';
import { MINDMAP_ELEMENT_TO_COMPONENT, SELECTED_MINDMAP_ELEMENTS } from '../utils/weak-maps';
import { withNodeDnd } from './with-dnd';

export const withMindmap: PlaitPlugin = (board: PlaitBoard) => {
    const {
        drawElement,
        dblclick,
        mousedown,
        globalMouseup,
        keydown,
        insertFragment,
        setFragment,
        deleteFragment,
        isIntersectionSelection
    } = board;

    board.drawElement = (context: PlaitPluginElementContext) => {
        if (PlaitMindmap.isPlaitMindmap(context.element)) {
            return PlaitMindmapComponent;
        }
        return drawElement(context);
    };

    board.isIntersectionSelection = (element) => {
        const nodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(element as MindmapNodeElement);
        if (nodeComponent && board.selection) {
            const target = getRectangleByNode(nodeComponent.node);
            return RectangleClient.isIntersect(RectangleClient.toRectangleClient([board.selection.anchor, board.selection.focus]), target);
        }
        return isIntersectionSelection(element);
    }

    // board.mousedown = (event: MouseEvent) => {
    //     // select mindmap node
    //     const point = transformPoint(board, toPoint(event.x, event.y, board.host));

    //     board.children.forEach((value: PlaitElement) => {
    //         if (PlaitMindmap.isPlaitMindmap(value)) {
    //             const mindmapComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(value) as PlaitMindmapComponent;
    //             const root = mindmapComponent?.root;
    //             (root as any).eachNode((node: MindmapNode) => {
    //                 if (hitMindmapNode(board, point, node)) {
    //                     addSelectedMindmapElements(board, node.origin);
    //                 } else {
    //                     hasSelectedMindmapElement(board, node.origin) && deleteSelectedMindmapElements(board, node.origin);
    //                 }
    //             });
    //         }
    //     });
    //     mousedown(event);
    // };

    // board.globalMouseup = (event: MouseEvent) => {
    //     const isBoardInside = event.target instanceof Node && board.host.contains(event.target);
    //     const isFakeNode = event.target instanceof HTMLElement && event.target.closest('.fake-node');
    //     const noSelectionElement = isNoSelectionElement(event);
    //     if (!isBoardInside && !noSelectionElement && !isFakeNode) {
    //         const hasSelectedElement = SELECTED_MINDMAP_ELEMENTS.has(board);
    //         if (hasSelectedElement) {
    //             clearAllSelectedMindmapElements(board);
    //         }
    //     }
    //     globalMouseup(event);
    // };

    board.keydown = (event: KeyboardEvent) => {
        if (board.options.readonly || IS_TEXT_EDITABLE.get(board)) {
            keydown(event);
            return;
        }
        const selectedElements = SELECTED_MINDMAP_ELEMENTS.get(board);
        if (selectedElements && selectedElements.length > 0) {
            if (event.key === 'Tab' || (event.key === 'Enter' && !selectedElements[0].isRoot)) {
                event.preventDefault();
                const selectedElement = selectedElements[0];
                deleteSelectedMindmapElements(board, selectedElement);
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
                    deleteSelectedMindmapElements(board, node);
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
                        addSelectedMindmapElements(board, lastNode.origin);
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
        const selectedNode = getSelectedMindmapElements(board)?.[0];
        if (selectedNode) {
            const stringObj = JSON.stringify(selectedNode);
            const encoded = window.btoa(encodeURIComponent(stringObj));
            const text = extractNodesText(selectedNode);
            data?.setData(`application/${CLIP_BOARD_FORMAT_KEY}`, encoded);
            data?.setData(`text/plain`, text);
            return;
        }
        setFragment(data);
    };

    board.insertFragment = (data: DataTransfer | null) => {
        if (board.options.readonly) {
            insertFragment(data);
            return;
        }
        const encoded = data?.getData(`application/${CLIP_BOARD_FORMAT_KEY}`);
        if (encoded) {
            const decoded = decodeURIComponent(window.atob(encoded));
            const nodeData = JSON.parse(decoded);
            const newElement: MindmapNodeElement = buildNodes(nodeData);
            const element = getSelectedMindmapElements(board)?.[0];
            const nodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(element);
            if (nodeComponent) {
                const path = findPath(board, nodeComponent.node).concat(nodeComponent.node.children.length);
                Transforms.insertNode(board, newElement, path);
                return;
            }
        } else {
            const text = data?.getData(`text/plain`) as string;
            const textWidth = getWidthByText(text, board.host.parentElement as any);
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
                const element = getSelectedMindmapElements(board)?.[0];
                const nodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(element);
                if (nodeComponent) {
                    const path = findPath(board, nodeComponent.node).concat(nodeComponent.node.children.length);
                    Transforms.insertNode(board, newElement, path);
                    return;
                }
            }
        }
        insertFragment(data);
    };

    board.deleteFragment = (data: DataTransfer | null) => {
        const selectedNode = getSelectedMindmapElements(board)?.[0];
        if (selectedNode && !board.options.readonly) {
            const nodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(selectedNode);
            if (nodeComponent) {
                const path = findPath(board, nodeComponent.node);
                deleteSelectedMindmapElements(board, selectedNode);
                Transforms.removeNode(board, path);
                return;
            }
        }
        deleteFragment(data);
    };

    return withNodeDnd(board);
};
