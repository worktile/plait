import { getSelectedElements, Path, PlaitBoard, PlaitElement, Point, Transforms, WritableClipboardOperationType } from '@plait/core';
import { MindElement, PlaitMind } from '../interfaces';
import { copyNewNode } from './mind';
import { getRectangleByNode } from './position/node';
import { AbstractNode, getNonAbstractChildren } from '@plait/layouts';
import { getRelativeStartEndByAbstractRef, getOverallAbstracts, getValidAbstractRefs } from './abstract/common';
import { createMindElement } from './node/create-node';
import { adjustAbstractToNode, adjustNodeToRoot, adjustRootToNode } from './node/adjust-node';
import { Element } from 'slate';
import { findNewChildNodePath } from './path';
import { PlaitMindBoard } from '../plugins/with-mind.board';

export const buildClipboardData = (board: PlaitBoard, selectedElements: MindElement[], startPoint: Point) => {
    let result: MindElement[] = [];

    // get overall abstract
    const overallAbstracts = getOverallAbstracts(board, selectedElements) as MindElement[];
    // get valid abstract refs
    const validAbstractRefs = getValidAbstractRefs(board, [...selectedElements, ...overallAbstracts]);

    // keep correct order
    const newSelectedElements = selectedElements.filter((value) => !validAbstractRefs.find((ref) => ref.abstract === value));
    newSelectedElements.push(...validAbstractRefs.map((value) => value.abstract));

    const selectedMindNodes = newSelectedElements.map((value) => MindElement.getNode(value));
    newSelectedElements.forEach((element, index) => {
        // handle relative location
        const nodeRectangle = getRectangleByNode(selectedMindNodes[index]);
        const points = [[nodeRectangle.x - startPoint[0], nodeRectangle.y - startPoint[1]]] as Point[];

        // handle invalid abstract
        const abstractRef = validAbstractRefs.find((ref) => ref.abstract === element);
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

export const insertClipboardData = (
    board: PlaitMindBoard,
    elements: PlaitElement[],
    targetPoint: Point,
    operationType?: WritableClipboardOperationType
) => {
    let newElement: MindElement, path: Path;
    const selectedElements = getSelectedElements(board);
    let newELements: PlaitElement[] = [];

    const hasTargetParent = selectedElements.length === 1;
    const targetParent = selectedElements[0];
    const targetParentPath = targetParent && PlaitBoard.findPath(board, targetParent);
    const nonAbstractChildrenLength = targetParent && getNonAbstractChildren(targetParent).length;

    if (targetParent && targetParent.isCollapsed) {
        Transforms.setNode(board, { isCollapsed: false }, targetParentPath);
    }

    elements.forEach((item: PlaitElement, index: number) => {
        newElement = copyNewNode(item as MindElement);
        if (hasTargetParent && operationType !== WritableClipboardOperationType.duplicate) {
            if (PlaitMind.isMind(item)) {
                newElement = adjustRootToNode(board, newElement);
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
            if (!PlaitMind.isMind(item)) {
                newElement = adjustNodeToRoot(board, newElement);
            }
            path = [board.children.length];
        }
        newELements.push(newElement);
        Transforms.insertNode(board, newElement, path);
        return;
    });
    Transforms.addSelectionWithTemporaryElements(board, newELements);
};

export const insertClipboardText = (board: PlaitMindBoard, targetParent: PlaitElement, text: string | Element) => {
    const newElement = createMindElement(text, {});
    const path = PlaitBoard.findPath(board, targetParent);
    Transforms.insertNode(board, newElement, findNewChildNodePath(board, targetParent));
    if (targetParent.isCollapsed) {
        Transforms.setNode(board, { isCollapsed: false }, path);
    }
    Transforms.addSelectionWithTemporaryElements(board, [newElement]);
};
