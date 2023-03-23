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
    Transforms
} from '@plait/core';
import { getSizeByText } from '@plait/richtext';
import { MindmapNodeElement, PlaitMindmap } from '../interfaces';
import { MindmapNode } from '../interfaces/node';
import { PlaitMindmapComponent } from '../mindmap.component';
import { changeRightNodeCount, createEmptyNode, filterChildElement, findPath, shouldChangeRightNodeCount } from '../utils';
import { getRectangleByNode, hitMindmapNode } from '../utils/graph';
import { isVirtualKey } from '../utils/is-virtual-key';
import { MINDMAP_ELEMENT_TO_COMPONENT } from '../utils/weak-maps';
import { withNodeDnd } from './with-dnd';
import { buildClipboardData, getDataFromClipboard, insertClipboardData, insertClipboardText, setClipboardData } from '../utils/clipboard';

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
        if (selectedElements) {
            if ((event.key === 'Tab' || (event.key === 'Enter' && !selectedElements[0].isRoot)) && selectedElements.length === 1) {
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

                //翻转，从下到上修改，防止找不到 path
                filterChildElement(selectedElements)
                    .reverse()
                    .map(node => {
                        const mindmapNodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(node);
                        if (mindmapNodeComponent) {
                            const path = findPath(board, mindmapNodeComponent.node);
                            const parentPath: Path = mindmapNodeComponent.parent ? findPath(board, mindmapNodeComponent!.parent) : [];

                            return () => {
                                if (shouldChangeRightNodeCount(node)) {
                                    changeRightNodeCount(board, parentPath, -1);
                                }
                                Transforms.removeNode(board, path);
                            };
                        }
                        return () => {};
                    })
                    .forEach(action => {
                        action();
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
            const elements = buildClipboardData(selectedElements);
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
        const selectedElement = getSelectedElements(board)?.[0];
        if (selectedElement && !board.options.readonly) {
            const nodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(selectedElement as MindmapNodeElement);
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
