import { Element, Path } from 'slate';
import { MindElement, PlaitMind } from '../interfaces/element';
import { PlaitBoard, PlaitHistoryBoard, PlaitNode, Transforms, removeSelectedElement } from '@plait/core';
import { AbstractRef, getRelativeStartEndByAbstractRef, insertElementHandleAbstract } from '../utils/abstract/common';
import { RightNodeCountRef, insertElementHandleRightNodeCount, isInRightBranchOfStandardLayout } from '../utils/node/right-node-count';
import { normalizeWidthAndHeight } from '../utils/space/node-space';
import { PlaitMindBoard } from '../plugins/with-mind.board';
import { findNewChildNodePath, findNewSiblingNodePath, insertMindElement } from '../utils';
import { setAbstractsByRefs } from './abstract-node';
import { AbstractNode } from '@plait/layouts';

export const setTopic = (board: PlaitMindBoard, element: MindElement, topic?: Element) => {
    const newElement = {
        data: { ...element.data }
    } as MindElement;
    if (topic) {
        newElement.data.topic = topic;
    }
    const path = PlaitBoard.findPath(board, element);
    Transforms.setNode(board, newElement, path);
};

export const setNodeManualWidth = (board: PlaitMindBoard, element: MindElement, width: number, height: number) => {
    const path = PlaitBoard.findPath(board, element);
    const { width: normalizedWidth } = normalizeWidthAndHeight(board, element, width, height);
    const newElement = { manualWidth: normalizedWidth } as MindElement;
    Transforms.setNode(board, newElement, path);
};

export const insertNodes = (board: PlaitBoard, elements: MindElement[], path: Path) => {
    const pathRef = board.pathRef(path);
    elements.forEach((element) => {
        if (pathRef.current) {
            Transforms.insertNode(board, element, pathRef.current);
        }
    });
    pathRef.unref();
};

export const insertAbstractNodes = (board: PlaitBoard, validAbstractRefs: AbstractRef[], elements: MindElement[], path: Path) => {
    const parent = PlaitNode.get(board, Path.parent(path));
    const abstractPath = [...Path.parent(path), parent.children?.length!];
    const abstracts = validAbstractRefs.map((refs) => {
        const { start, end } = getRelativeStartEndByAbstractRef(refs, elements);
        return {
            ...refs.abstract,
            start: start + path[path.length - 1],
            end: end + path[path.length - 1]
        };
    });

    insertNodes(board, abstracts, abstractPath);
};

export const setRightNodeCountByRefs = (board: PlaitBoard, refs: RightNodeCountRef[]) => {
    refs.forEach((ref) => {
        Transforms.setNode(board, { rightNodeCount: ref.rightNodeCount }, ref.path);
    });
};

export const insertChildNode = (board: PlaitMindBoard, element: MindElement) => {
    if (MindElement.isMindElement(board, element)) {
        removeSelectedElement(board, element);
        const targetElementPath = PlaitBoard.findPath(board, element);
        if (element.isCollapsed) {
            const newElement: Partial<MindElement> = { isCollapsed: false };
            PlaitHistoryBoard.withoutSaving(board, () => {
                Transforms.setNode(board, newElement, targetElementPath);
            });
        }
        insertMindElement(board, element, findNewChildNodePath(board, element));
    }
};

export const insertSiblingNode = (board: PlaitMindBoard, element: MindElement) => {
    if (MindElement.isMindElement(board, element) && !PlaitMind.isMind(element) && !AbstractNode.isAbstract(element)) {
        const path = PlaitBoard.findPath(board, element);
        if (isInRightBranchOfStandardLayout(element)) {
            const refs = insertElementHandleRightNodeCount(board, path.slice(0, 1), 1);
            setRightNodeCountByRefs(board, refs);
        }
        const abstractRefs = insertElementHandleAbstract(board, Path.next(path));
        setAbstractsByRefs(board, abstractRefs);
        insertMindElement(board, element, findNewSiblingNodePath(board, element));
    }
};

export const insertMind = (board: PlaitMindBoard, mind: MindElement) => {
    Transforms.insertNode(board, mind, [board.children.length]);
    Transforms.addSelectionWithTemporaryElements(board, [mind]);
};
