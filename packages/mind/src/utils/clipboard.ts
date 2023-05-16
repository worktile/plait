import {
    CLIP_BOARD_FORMAT_KEY,
    getRectangleByElements,
    getSelectedElements,
    Path,
    PlaitBoard,
    PlaitElement,
    Point,
    Transforms
} from '@plait/core';
import { MindElement } from '../interfaces';
import { copyNewNode, extractNodesText, transformNodeToRoot, transformRootToNode, createMindElement, transformAbstractToNode } from '.';
import { getRectangleByNode } from './graph';
import { AbstractNode, getNonAbstractChildren } from '@plait/layouts';
import { getOverallAbstracts } from './abstract/common';

export const buildClipboardData = (board: PlaitBoard, selectedElements: MindElement[]) => {
    let result: MindElement[] = [];

    // get overall abstract
    const overallAbstracts = getOverallAbstracts(board, selectedElements) as MindElement[];

    // keep correct order
    const newSelectedElements = selectedElements.filter((value) => !overallAbstracts.includes(value));
    newSelectedElements.push(...overallAbstracts);

    // get correct start and end in selected elements
    function getCorrectStartEnd(abstract: MindElement & AbstractNode) {
        const parent = MindElement.getParent(abstract);
        const startElement = parent.children[abstract.start];
        const index = selectedElements.indexOf(startElement);
        return { start: index, end: index + (abstract.end - abstract.start) };
    }

    const selectedMindNodes = newSelectedElements.map(value => MindElement.getNode(value));
    const nodesRectangle = getRectangleByElements(board, newSelectedElements, true);
    newSelectedElements.forEach((element, index) => {
        // handle relative location
        const nodeRectangle = getRectangleByNode(selectedMindNodes[index]);
        const points = [[nodeRectangle.x - nodesRectangle.x, nodeRectangle.y - nodesRectangle.y]] as Point[];

        // handle invalid abstract
        if (AbstractNode.isAbstract(element) && overallAbstracts.includes(element)) {
            const { start, end } = getCorrectStartEnd(element);
            result.push({
                ...element,
                points,
                start,
                end
            });
        } else {
            if (AbstractNode.isAbstract(element)) {
                let newElement = { ...element, points } as MindElement;
                delete newElement.start;
                delete newElement.end;
                result.push(newElement);
            } else {
                result.push({
                    ...element,
                    points: points
                });
            }
        }
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

    const hasTargetParent = selectedElements.length === 1;
    const targetParent = selectedElements[0];
    const targetParentPath = targetParent && PlaitBoard.findPath(board, targetParent);
    const nonAbstractChildrenLength = targetParent && getNonAbstractChildren(targetParent).length;

    elements.forEach((item: PlaitElement, index: number) => {
        newElement = copyNewNode(item as MindElement);

        if (hasTargetParent) {
            if (item.isRoot) {
                newElement = transformRootToNode(board, newElement);
            }
            // handle abstract start and end
            if (AbstractNode.isAbstract(newElement)) {
                newElement.start = newElement.start + nonAbstractChildrenLength;
                newElement.end = newElement.end + nonAbstractChildrenLength;
            }
            path = [...targetParentPath, nonAbstractChildrenLength + index];
        } else {
            const point: Point = [targetPoint[0] + item.points![0][0], targetPoint[1] + item.points![0][1]];
            newElement.points = [point];

            if (AbstractNode.isAbstract(item)) {
                newElement = transformAbstractToNode(newElement);
            }

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
