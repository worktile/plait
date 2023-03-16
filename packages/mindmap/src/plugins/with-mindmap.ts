import {
    addSelectedElement,
    CLIP_BOARD_FORMAT_KEY,
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
import { MindmapLayoutType } from '@plait/layouts';
import { MindmapNodeElement, PlaitMindmap } from '../interfaces';
import { clipboardNode, MindmapNode } from '../interfaces/node';
import { PlaitMindmapComponent } from '../mindmap.component';
import { buildNodes, changeRightNodeCount, createEmptyNode, extractNodesText, findPath } from '../utils';
import { getRectangleByNode, getRectangleByNodes, hitMindmapNode } from '../utils/graph';
import { isVirtualKey } from '../utils/is-virtual-key';
import { MINDMAP_ELEMENT_TO_COMPONENT } from '../utils/weak-maps';
import { withNodeDnd } from './with-dnd';
import { MindmapNodeComponent } from '../node.component';

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
        const selectedNode = getSelectedElements(board)?.[0];

        let selectedLayoutNode = (MINDMAP_ELEMENT_TO_COMPONENT.get(selectedNode as MindmapNodeElement) as MindmapNodeComponent)?.node;
        const nodesRectangle = getRectangleByNodes([selectedLayoutNode]);
        const selectNodeRectangle = getRectangleByNode(selectedLayoutNode);
        const clipboardNode: clipboardNode = {
            nodeData: selectedNode,
            point: [selectNodeRectangle.x - nodesRectangle.x, selectNodeRectangle.y - nodesRectangle.y]
        };

        if (selectedNode) {
            const stringObj = JSON.stringify(clipboardNode);
            const encoded = window.btoa(encodeURIComponent(stringObj));
            const text = extractNodesText(selectedNode as MindmapNodeElement);
            data?.setData(`application/${CLIP_BOARD_FORMAT_KEY}`, encoded);
            data?.setData(`text/plain`, text);
            return;
        }
        setFragment(data);
    };

    board.insertFragment = (data: DataTransfer | null, targetPoint?: Point) => {
        if (board.options.readonly) {
            insertFragment(data, targetPoint);
            return;
        }
        const encoded = data?.getData(`application/${CLIP_BOARD_FORMAT_KEY}`);
        if (encoded) {
            const decoded = decodeURIComponent(window.atob(encoded));
            const { nodeData, point } = JSON.parse(decoded) as clipboardNode;

            const newElement: MindmapNodeElement = buildNodes(nodeData as MindmapNodeElement);
            const element = getSelectedElements(board)?.[0];
            const nodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(element as MindmapNodeElement);

            if (nodeComponent) {
                const path = findPath(board, nodeComponent.node).concat(nodeComponent.node.children.length);
                Transforms.insertNode(board, newElement, path);
                return;
            } else if (targetPoint) {
                const mindmap = {
                    ...newElement,
                    layout: newElement.layout ?? MindmapLayoutType.standard,
                    isCollapsed: false,
                    isRoot: true,
                    points: [[targetPoint[0] + point[0], targetPoint[1] + point[1]]],
                    rightNodeCount: newElement.children.length,
                    type: 'mindmap'
                };

                Transforms.insertNode(board, mindmap, [board.children.length]);
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
