import {
    CLIP_BOARD_FORMAT_KEY,
    getRectangleByElements,
    getSelectedElements,
    idCreator,
    Path,
    PlaitBoard,
    PlaitElement,
    Point,
    Transforms
} from '@plait/core';
import { MindElement } from '../interfaces';
import { copyNewNode, insertMindElement, extractNodesText, transformNodeToRoot, transformRootToNode, createMindElement } from '.';
import { getRectangleByNode } from './graph';
import { MINDMAP_ELEMENT_TO_COMPONENT } from './weak-maps';
import { MindNodeComponent } from '../node.component';
import { TEXT_DEFAULT_HEIGHT } from '@plait/richtext';

export const buildClipboardData = (board: PlaitBoard, selectedElements: MindElement[]) => {
    let result: MindElement[] = [];
    const selectedMindmapNodes = Array.from(selectedElements, node => {
        return (MINDMAP_ELEMENT_TO_COMPONENT.get(node) as MindNodeComponent)?.node;
    });
    const nodesRectangle = getRectangleByElements(board, selectedElements, true);
    selectedElements.forEach((node, index) => {
        const nodeRectangle = getRectangleByNode(selectedMindmapNodes[index]);
        result.push({
            ...node,
            points: [[nodeRectangle.x - nodesRectangle.x, nodeRectangle.y - nodesRectangle.y]]
        });
    });

    return result;
};

export const setClipboardData = (data: DataTransfer | null, elements: MindElement[]) => {
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

export const insertClipboardData = (board: PlaitBoard, elements: PlaitElement[], targetPoint: Point) => {
    let newElement: MindElement, path: Path;
    const selectedElements = getSelectedElements(board);
    let newELements: PlaitElement[] = [];

    elements.forEach((item: PlaitElement, index: number) => {
        newElement = copyNewNode(item as MindElement);

        if (selectedElements.length === 1) {
            if (item.isRoot) {
                newElement = transformRootToNode(board, newElement);
            }
            const selectedElementPath = PlaitBoard.findPath(board, selectedElements[0]);
            path = selectedElementPath.concat((selectedElements[0].children || []).length + index);
        } else {
            const point: Point = [targetPoint[0] + item.points![0][0], targetPoint[1] + item.points![0][1]];
            newElement.points = [point];
            if (!item.isRoot) {
                newElement = transformNodeToRoot(board, newElement);
            }

            path = [board.children.length];
        }
        newELements.push(newElement);
        Transforms.insertNode(board, newElement, path);
        return;
    });
    Transforms.setSelectionWithTemporaryElements(board, newELements);
};

export const insertClipboardText = (board: PlaitBoard, parentElement: PlaitElement, text: string, width: number, height: number) => {
    const newElement = createMindElement(text, width, height, {});
    const path = PlaitBoard.findPath(board, parentElement).concat((parentElement.children || []).length);
    Transforms.insertNode(board, newElement, path);
    return;
};
