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
import { MindElement, PlaitMind } from '../interfaces';
import { copyNewNode, extractNodesText } from './mind';
import { getRectangleByNode } from './position/node';
import { AbstractNode, getNonAbstractChildren } from '@plait/layouts';
import { getRelativeStartEndByAbstractRef, getOverallAbstracts, getValidAbstractRefs } from './abstract/common';
import { createMindElement } from './node/create-node';
import { adjustAbstractToNode, adjustNodeToRoot, adjustRootToNode } from './node/adjust-node';
import { Element, Node } from 'slate';
import { getTextSize, PlaitMarkEditor } from '@plait/text';
import { BRANCH_FONT_FAMILY, DEFAULT_FONT_FAMILY, TOPIC_DEFAULT_MAX_WORD_COUNT } from '../constants/node-topic-style';
import { findNewChildNodePath } from './path';
import { PlaitMindBoard } from '../plugins/with-mind.board';
import { getFontSizeBySlateElement, getNodeDefaultFontSize, NodeSpace } from './space/node-space';

export const buildClipboardData = (board: PlaitBoard, selectedElements: MindElement[]) => {
    let result: MindElement[] = [];

    // get overall abstract
    const overallAbstracts = getOverallAbstracts(board, selectedElements) as MindElement[];
    // get valid abstract refs
    const validAbstractRefs = getValidAbstractRefs(board, [...selectedElements, ...overallAbstracts]);

    // keep correct order
    const newSelectedElements = selectedElements.filter(value => !validAbstractRefs.find(ref => ref.abstract === value));
    newSelectedElements.push(...validAbstractRefs.map(value => value.abstract));

    const selectedMindNodes = newSelectedElements.map(value => MindElement.getNode(value));
    const nodesRectangle = getRectangleByElements(board, newSelectedElements, true);
    newSelectedElements.forEach((element, index) => {
        // handle relative location
        const nodeRectangle = getRectangleByNode(selectedMindNodes[index]);
        const points = [[nodeRectangle.x - nodesRectangle.x, nodeRectangle.y - nodesRectangle.y]] as Point[];

        // handle invalid abstract
        const abstractRef = validAbstractRefs.find(ref => ref.abstract === element);
        if (AbstractNode.isAbstract(element) && abstractRef) {
            const { start, end } = getRelativeStartEndByAbstractRef(abstractRef, newSelectedElements);
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

export const insertClipboardData = (board: PlaitMindBoard, elements: PlaitElement[], targetPoint: Point) => {
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
                newElement = adjustRootToNode(board, newElement);
                const styles = PlaitMind.isMind(targetParent) ? { fontFamily: BRANCH_FONT_FAMILY } : { fontFamily: DEFAULT_FONT_FAMILY };
                const { width, height } = getTextSize(board, newElement.data.topic, TOPIC_DEFAULT_MAX_WORD_COUNT, styles);
                newElement.width = Math.max(width, getNodeDefaultFontSize());
                newElement.height = height;
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
                newElement = adjustAbstractToNode(newElement);
            }

            if (!item.isRoot) {
                newElement = adjustNodeToRoot(board, newElement);
            }

            path = [board.children.length];
        }
        newELements.push(newElement);
        Transforms.insertNode(board, newElement, path);
        return;
    });
    Transforms.setSelectionWithTemporaryElements(board, newELements);
};

export const insertClipboardText = (board: PlaitMindBoard, targetParent: PlaitElement, text: string | Element) => {
    const styles = PlaitMind.isMind(targetParent) ? { fontFamily: BRANCH_FONT_FAMILY } : { fontFamily: DEFAULT_FONT_FAMILY };
    const { width, height } = getTextSize(board, text, TOPIC_DEFAULT_MAX_WORD_COUNT, styles);
    const newElement = createMindElement(text, Math.max(width, getFontSizeBySlateElement(text)), height, {});
    Transforms.insertNode(board, newElement, findNewChildNodePath(board, targetParent));
    return;
};
