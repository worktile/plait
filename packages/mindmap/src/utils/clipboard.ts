import { CLIP_BOARD_FORMAT_KEY, getSelectedElements, idCreator, Path, PlaitBoard, PlaitElement, Point, Transforms } from '@plait/core';
import { MindmapNodeElement } from '../interfaces';
import { copyNewNode, extractNodesText, findPath, transformNodeToRoot, transformRootToNode } from '../utils';
import { getRectangleByNode, getRectangleByNodes } from '../utils/graph';
import { MINDMAP_ELEMENT_TO_COMPONENT } from '../utils/weak-maps';
import { MindmapNodeComponent } from '../node.component';

export const buildClipboardData = (selectedNodes: MindmapNodeElement[]) => {
    let result: MindmapNodeElement[] = [];
    const selectedMindmapNodes = Array.from(selectedNodes, node => {
        return (MINDMAP_ELEMENT_TO_COMPONENT.get(node) as MindmapNodeComponent)?.node;
    });

    const nodesRectangle = getRectangleByNodes(selectedMindmapNodes);

    selectedNodes.forEach((node, index) => {
        const nodeRectangle = getRectangleByNode(selectedMindmapNodes[index]);
        result.push({
            ...node,
            points: [[nodeRectangle.x - nodesRectangle.x, nodeRectangle.y - nodesRectangle.y]]
        });
    });

    return result;
};

export const setClipboardData = (data: DataTransfer | null, elements: MindmapNodeElement[]) => {
    const stringObj = JSON.stringify(elements);
    const encoded = window.btoa(encodeURIComponent(stringObj));
    const text = elements.reduce((string, currentNode) => {
        return string + extractNodesText(currentNode);
    }, '');
    data?.setData(`application/${CLIP_BOARD_FORMAT_KEY}`, encoded);
    data?.setData(`text/plain`, text);
};

export const getDataFromClipboard = (data: DataTransfer | null) => {
    const encoded = data?.getData(`application/${CLIP_BOARD_FORMAT_KEY}`);
    let nodesData: PlaitElement[] = [];
    if (encoded) {
        const decoded = decodeURIComponent(window.atob(encoded));
        nodesData = JSON.parse(decoded);
    }
    return nodesData;
};

export const insertClipboardData = (board: PlaitBoard, nodesData: PlaitElement[], targetPoint: Point) => {
    let selectedElementPath: Path, newElement: MindmapNodeElement, path: Path;
    const element = getSelectedElements(board)?.[0];
    const selectedComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(element as MindmapNodeElement) as MindmapNodeComponent;

    if (selectedComponent) {
        selectedElementPath = findPath(board, selectedComponent.node);
    }

    nodesData.forEach((item: PlaitElement, index: number) => {
        newElement = copyNewNode(item as MindmapNodeElement);

        if (getSelectedElements(board).length === 1) {
            if (item.isRoot) {
                newElement = transformRootToNode(newElement, board);
            }
            path = selectedElementPath.concat(selectedComponent.node.children.length + index);
        } else {
            const point: Point = [targetPoint[0] + item.points![0][0], targetPoint[1] + item.points![0][1]];
            newElement.points = [point];
            if (!item.isRoot) {
                newElement = transformNodeToRoot(newElement, board);
            }

            path = [board.children.length];
        }

        Transforms.insertNode(board, newElement, path);
        return;
    });
};

export const insertClipboardText = (board: PlaitBoard, text: string, textWidth: number) => {
    const newElement = {
        id: idCreator(),
        value: {
            children: [{ text }]
        },
        children: [],
        width: textWidth,
        height: 24
    };
    const element = getSelectedElements(board)[0];
    const nodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(element as MindmapNodeElement);

    if (nodeComponent) {
        const path = findPath(board, nodeComponent.node).concat(nodeComponent.node.children.length);
        Transforms.insertNode(board, newElement, path);
        return;
    }
};
