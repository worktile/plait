import { Element, Path } from 'slate';
import { MindElement } from '../interfaces/element';
import { PlaitBoard, PlaitNode, Transforms } from '@plait/core';
import { getFirstLevelElement } from '../utils/mind';
import { AbstractRef, getRelativeStartEndByAbstractRef } from '../utils/abstract/common';
import { RightNodeCountRef } from '../utils/node/right-node-count';
import { NodeSpace } from '../utils/space/node-space';
import { PlaitMindBoard } from '../plugins/with-mind.board';

const normalizeWidthAndHeight = (board: PlaitMindBoard, element: MindElement, width: number, height: number) => {
    const minWidth = NodeSpace.getNodeTopicMinWidth(board, element, element.isRoot);
    const newWidth = width < minWidth * board.viewport.zoom ? minWidth : width / board.viewport.zoom;
    const newHeight = height / board.viewport.zoom;
    return { width: newWidth, height: newHeight };
};

export const setTopic = (board: PlaitMindBoard, element: MindElement, topic: Element, width: number, height: number) => {
    const newElement = {
        data: { ...element.data, topic },
        ...normalizeWidthAndHeight(board, element, width, height)
    } as MindElement;
    const path = PlaitBoard.findPath(board, element);
    Transforms.setNode(board, newElement, path);
};

export const setTopicSize = (board: PlaitMindBoard, element: MindElement, width: number, height: number) => {
    const newElement = {
        ...normalizeWidthAndHeight(board, element, width, height)
    };
    if (Math.floor(element.width) !== Math.floor(newElement.width) || Math.floor(element.height) !== Math.floor(newElement.height)) {
        const path = PlaitBoard.findPath(board, element);
        Transforms.setNode(board, newElement, path);
    }
};

export const removeElements = (board: PlaitBoard, elements: MindElement[]) => {
    const deletableElements = getFirstLevelElement(elements);

    deletableElements
        .map(element => {
            const path = PlaitBoard.findPath(board, element);
            const ref = board.pathRef(path);
            return () => {
                Transforms.removeNode(board, ref.current!);
                ref.unref();
            };
        })
        .forEach(action => {
            action();
        });
};

export const insertNodes = (board: PlaitBoard, elements: MindElement[], path: Path) => {
    const pathRef = board.pathRef(path);
    elements.forEach(element => {
        if (pathRef.current) {
            Transforms.insertNode(board, element, pathRef.current);
        }
    });
    pathRef.unref();
};

export const insertAbstractNodes = (board: PlaitBoard, validAbstractRefs: AbstractRef[], elements: MindElement[], path: Path) => {
    const parent = PlaitNode.get(board, Path.parent(path));
    const abstractPath = [...Path.parent(path), parent.children?.length!];
    const abstracts = validAbstractRefs.map(refs => {
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
    refs.forEach(ref => {
        Transforms.setNode(board, { rightNodeCount: ref.rightNodeCount }, ref.path);
    });
};
