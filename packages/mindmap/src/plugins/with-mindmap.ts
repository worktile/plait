import { isPlaitMindmap, PlaitMindmap } from '../interfaces/mindmap';
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
    PlaitPlugin
} from '@plait/core';
import { PlaitMindmapComponent } from '../mindmap.component';
import {
    HAS_SELECTED_MINDMAP,
    HAS_SELECTED_MINDMAP_ELEMENT,
    MINDMAP_ELEMENT_TO_COMPONENT,
    SELECTED_MINDMAP_NODES
} from '../utils/weak-maps';
import { hitMindmapNode } from '../utils/graph';
import { MindmapNode } from '../interfaces/node';
import { SimpleChanges } from '@angular/core';
import { MINDMAP_TO_COMPONENT } from './weak-maps';
import { findPath } from '../utils';
import { withNodeDnd } from './with-dnd';
import { MindmapElement } from '../interfaces';

export const withMindmap: PlaitPlugin = (board: PlaitBoard) => {
    const { drawElement, dblclick, mousedown, mousemove, mouseup, keydown } = board;

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
        if (IS_TEXT_EDITABLE.get(board)) {
            mousedown(event);
            return;
        }

        // select mindmap node
        const point = transformPoint(board, toPoint(event.x, event.y, board.host));
        const nodes: MindmapElement[] = [];
        let selectedMindmap: PlaitMindmap | null = null;

        board.children.forEach((value: PlaitElement) => {
            if (isPlaitMindmap(value)) {
                const mindmapComponent = MINDMAP_TO_COMPONENT.get(value);
                const root = mindmapComponent?.root;
                (root as any).eachNode((node: MindmapNode) => {
                    if (hitMindmapNode(board, point, node)) {
                        HAS_SELECTED_MINDMAP_ELEMENT.set(node.origin, true);
                        selectedMindmap = value;
                        nodes.push(node.origin);
                    } else {
                        HAS_SELECTED_MINDMAP_ELEMENT.has(node.origin) && HAS_SELECTED_MINDMAP_ELEMENT.delete(node.origin);
                    }
                });
            }
            if (selectedMindmap) {
                HAS_SELECTED_MINDMAP.set(board, selectedMindmap);
            } else {
                HAS_SELECTED_MINDMAP.has(board) && HAS_SELECTED_MINDMAP.delete(board);
            }
        });

        if (nodes.length > 0) {
            SELECTED_MINDMAP_NODES.set(board, nodes);
        }
        if (nodes.length === 0 && SELECTED_MINDMAP_NODES.has(board)) {
            SELECTED_MINDMAP_NODES.delete(board);
        }

        mousedown(event);
    };

    board.keydown = (event: KeyboardEvent) => {
        if (board.readonly || IS_TEXT_EDITABLE.get(board)) {
            keydown(event);
            return;
        }
        if (event.key === 'Tab' || event.key === 'Enter') {
            event.preventDefault();
            const plaitMindmap = HAS_SELECTED_MINDMAP.get(board);
            if (plaitMindmap) {
                const mindmapComponent = MINDMAP_TO_COMPONENT.get(plaitMindmap);
                const root = mindmapComponent?.root;
                (root as any).eachNode((node: MindmapNode) => {
                    const element = node.origin;
                    if (HAS_SELECTED_MINDMAP_ELEMENT.has(element)) {
                        HAS_SELECTED_MINDMAP_ELEMENT.delete(element);
                        let path = [];
                        if (event.key === 'Tab') {
                            path = findPath(board, node).concat(node.children.length);
                        } else {
                            path = Path.next(findPath(board, node));
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
                        setTimeout(() => {
                            const nodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(newElement);
                            HAS_SELECTED_MINDMAP_ELEMENT.set(newElement, true);
                            if (nodeComponent) {
                                nodeComponent.startEditText();
                            }
                        }, 0);
                        Transforms.insertNode(board, newElement, path);
                        return;
                    }
                });
            }
        }
        if (hotkeys.isDeleteBackward(event)) {
            event.preventDefault();
            const plaitMindmap = HAS_SELECTED_MINDMAP.get(board);
            if (plaitMindmap) {
                const mindmapComponent = MINDMAP_TO_COMPONENT.get(plaitMindmap);
                const root = mindmapComponent?.root;
                (root as any).eachNode((node: MindmapNode) => {
                    if (HAS_SELECTED_MINDMAP_ELEMENT.has(node.origin)) {
                        const path = findPath(board, node);
                        Transforms.removeNode(board, path);
                        return;
                    }
                });
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

    return withNodeDnd(board);
};
