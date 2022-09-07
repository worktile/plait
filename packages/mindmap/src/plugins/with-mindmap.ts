import { isPlaitMindmap } from '../interfaces/mindmap';
import {
    hotkeys,
    Path,
    PlaitBoard,
    toPoint,
    transformPoint,
    IS_TEXT_EDITABLE,
    Transforms,
    idCreator,
    PlaitElementContext,
    PlaitElement,
    PlaitPlugin,
    isNoSelectionElement,
    CLIP_BOARD_FORMAT_KEY
} from '@plait/core';
import { PlaitMindmapComponent } from '../mindmap.component';
import { MINDMAP_ELEMENT_TO_COMPONENT, SELECTED_MINDMAP_ELEMENTS } from '../utils/weak-maps';
import { hitMindmapNode } from '../utils/graph';
import { MindmapNode } from '../interfaces/node';
import { SimpleChanges } from '@angular/core';
import { MINDMAP_TO_COMPONENT } from './weak-maps';
import { buildNodes, extractNodesText, findPath } from '../utils';
import { withNodeDnd } from './with-dnd';
import { MindmapElement } from '../interfaces';
import {
    addSelectedMindmapElements,
    clearAllSelectedMindmapElements,
    deleteSelectedMindmapElements,
    getSelectedMindmapElements,
    hasSelectedMindmapElement
} from '../utils/selected-elements';

export const withMindmap: PlaitPlugin = (board: PlaitBoard) => {
    const { drawElement, dblclick, mousedown, globalMouseup, keydown, insertFragment, setFragment, deleteFragment } = board;

    board.drawElement = (context: PlaitElementContext) => {
        const { element, selection, viewContainerRef, host } = context.elementInstance;
        if (isPlaitMindmap(element)) {
            const mindmapComponentRef = viewContainerRef.createComponent(PlaitMindmapComponent);
            const mindmapInstance = mindmapComponentRef.instance;
            mindmapInstance.value = element;
            mindmapInstance.selection = selection;
            mindmapInstance.host = host;
            mindmapInstance.board = board;
            return [mindmapInstance.mindmapGGroup];
        }
        return drawElement(context);
    };

    board.redrawElement = (context: PlaitElementContext, changes: SimpleChanges) => {
        const { element, selection } = context.elementInstance;
        const elementChange = changes['element'];
        if (isPlaitMindmap(element)) {
            const previousElement = (elementChange && elementChange.previousValue) || element;
            const mindmapInstance = MINDMAP_TO_COMPONENT.get(previousElement);
            if (!mindmapInstance) {
                throw new Error('undefined mindmap component');
            }
            mindmapInstance.value = element;
            mindmapInstance.selection = selection;
            if (elementChange) {
                mindmapInstance.updateMindmap();
            } else {
                mindmapInstance.doCheck();
            }
            return [mindmapInstance.mindmapGGroup];
        }
        return drawElement(context);
    };

    board.mousedown = (event: MouseEvent) => {
        // select mindmap node
        const point = transformPoint(board, toPoint(event.x, event.y, board.host));
        const nodes: MindmapElement[] = [];

        board.children.forEach((value: PlaitElement) => {
            if (isPlaitMindmap(value)) {
                const mindmapComponent = MINDMAP_TO_COMPONENT.get(value);
                const root = mindmapComponent?.root;
                (root as any).eachNode((node: MindmapNode) => {
                    if (hitMindmapNode(board, point, node)) {
                        addSelectedMindmapElements(board, node.origin);
                        nodes.push(node.origin);
                    } else {
                        hasSelectedMindmapElement(board, node.origin) && deleteSelectedMindmapElements(board, node.origin);
                    }
                });
            }
        });
        mousedown(event);
    };

    board.globalMouseup = (event: MouseEvent) => {
        const isBoardInside = event.target instanceof Node && board.host.contains(event.target);
        const isFakeNode = event.target instanceof HTMLElement && event.target.closest('.fake-node');
        const noSelectionElement = isNoSelectionElement(event);
        if (!isBoardInside && !noSelectionElement && !isFakeNode) {
            const hasSelectedElement = SELECTED_MINDMAP_ELEMENTS.has(board);
            if (hasSelectedElement) {
                clearAllSelectedMindmapElements(board);
            }
        }
        globalMouseup(event);
    };

    board.keydown = (event: KeyboardEvent) => {
        if (board.readonly || IS_TEXT_EDITABLE.get(board)) {
            keydown(event);
            return;
        }
        if (event.key === 'Tab' || event.key === 'Enter') {
            event.preventDefault();
            const selectedNodes = SELECTED_MINDMAP_ELEMENTS.get(board);
            if (selectedNodes?.length === 1) {
                const selectedNode = selectedNodes[0];
                deleteSelectedMindmapElements(board, selectedNode);
                let path: number[] = [];
                const mindmapNodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(selectedNode);
                if (event.key === 'Tab') {
                    if (mindmapNodeComponent) {
                        path = findPath(board, mindmapNodeComponent.node).concat(mindmapNodeComponent.node.children.length);
                    }
                } else {
                    if (mindmapNodeComponent) {
                        path = Path.next(findPath(board, mindmapNodeComponent.node));
                    }
                }
                const newElement = {
                    id: idCreator(),
                    value: {
                        children: [{ text: '' }]
                    },
                    children: [],
                    width: 5,
                    height: 22
                };
                Transforms.insertNode(board, newElement, path);
                addSelectedMindmapElements(board, newElement);
                setTimeout(() => {
                    const nodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(newElement);
                    if (nodeComponent) {
                        nodeComponent.startEditText();
                    }
                }, 0);
                return;
            }
        }
        if (hotkeys.isDeleteBackward(event)) {
            event.preventDefault();
            const selectedNodes = SELECTED_MINDMAP_ELEMENTS.get(board);
            if (selectedNodes && selectedNodes.length) {
                if (isPlaitMindmap(selectedNodes[0]) && board.children.length === 1 && !board.allowClearBoard) {
                    return;
                }
                selectedNodes?.forEach(node => {
                    deleteSelectedMindmapElements(board, node);
                    const mindmapNodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(node);
                    if (mindmapNodeComponent) {
                        const path = findPath(board, mindmapNodeComponent.node);
                        Transforms.removeNode(board, path);
                    }
                });
            }
            if (selectedNodes?.length === 1) {
                let lastNode: MindmapNode | any = null;
                const selectNode = selectedNodes[0];
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
        }
        keydown(event);
    };

    board.dblclick = (event: MouseEvent) => {
        if (board.readonly || IS_TEXT_EDITABLE.get(board)) {
            dblclick(event);
            return;
        }
        const point = transformPoint(board, toPoint(event.x, event.y, board.host));
        let startEdit = false;
        board.children.forEach((value: PlaitElement) => {
            if (isPlaitMindmap(value)) {
                const mindmapComponent = MINDMAP_TO_COMPONENT.get(value);
                const root = mindmapComponent?.root;
                (root as any).eachNode((node: MindmapNode) => {
                    if (startEdit) {
                        return;
                    }
                    if (hitMindmapNode(board, point, node)) {
                        const nodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(node.origin);
                        if (nodeComponent) {
                            nodeComponent.startEditText();
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
        if (data == null) {
            setFragment(data);
            return;
        } else {
            const selectedNode = getSelectedMindmapElements(board)?.[0];
            if (selectedNode) {
                const stringObj = JSON.stringify(selectedNode);
                const encoded = window.btoa(encodeURIComponent(stringObj));
                const text = extractNodesText(selectedNode);
                data.setData(`application/${CLIP_BOARD_FORMAT_KEY}`, encoded);
                data.setData(`text/plain`, text);
            }
            setFragment(data);
        }
    };
    board.insertFragment = (data: DataTransfer | null) => {
        if (data == null) {
            insertFragment(data);
            return;
        } else {
            const encoded = data?.getData(`application/${CLIP_BOARD_FORMAT_KEY}`);
            if (encoded) {
                const decoded = decodeURIComponent(window.atob(encoded));
                const nodeData = JSON.parse(decoded);
                const newElement: MindmapElement = buildNodes(nodeData);
                const element = getSelectedMindmapElements(board)?.[0];
                const nodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(element);
                if (nodeComponent) {
                    const path = findPath(board, nodeComponent.node).concat(nodeComponent.node.children.length);
                    console.log(path);
                    Transforms.insertNode(board, newElement, path);
                }
            } else {
                const text = data.getData(`text/plain`);
                if (text) {
                    const newElement = {
                        id: idCreator(),
                        value: {
                            children: [{ text }]
                        },
                        children: [],
                        width: 200,
                        height: 22
                    };
                    const element = getSelectedMindmapElements(board)?.[0];
                    const nodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(element);
                    if (nodeComponent) {
                        const path = findPath(board, nodeComponent.node).concat(nodeComponent.node.children.length);
                        Transforms.insertNode(board, newElement, path);
                    }
                }
            }
            insertFragment(data);
        }
    };

    board.deleteFragment = (data: DataTransfer | null) => {
        if (data == null) {
            deleteFragment(data);
            return;
        } else {
            const selectedNode = getSelectedMindmapElements(board)?.[0];
            if (selectedNode) {
                const stringObj = JSON.stringify(selectedNode);
                const encoded = window.btoa(encodeURIComponent(stringObj));
                const text = extractNodesText(selectedNode);
                data.setData(`application/${CLIP_BOARD_FORMAT_KEY}`, encoded);
                data.setData(`text/plain`, text);
                const nodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(selectedNode);
                if (nodeComponent) {
                    const path = findPath(board, nodeComponent.node);
                    deleteSelectedMindmapElements(board, selectedNode);
                    Transforms.removeNode(board, path);
                }
            }
            deleteFragment(data);
        }
    };

    return withNodeDnd(board);
};
