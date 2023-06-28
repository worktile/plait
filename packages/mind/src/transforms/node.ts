import { Element, Path } from 'slate';
import { MindElement } from '../interfaces/element';
import { NODE_MIN_WIDTH } from '../constants/node-rule';
import { PlaitBoard, PlaitNode, Transforms } from '@plait/core';
import { getFirstLevelElement } from '../utils/mind';
import { AbstractRef, getRelativeStartEndByAbstractRef } from '../utils/abstract/common';
import { RightNodeCountRef } from '../utils/node/right-node-count';

// 1. When the text at the end has an italic attribute, the text is partially covered
// 2. There will be some differences in the width measured by different browsers
const WIDTH_BUFFER = 4;

const normalizeWidthAndHeight = (board: PlaitBoard, width: number, height: number) => {
    const normalizeWidth = width + WIDTH_BUFFER * board.viewport.zoom;
    const newWidth = normalizeWidth < NODE_MIN_WIDTH * board.viewport.zoom ? NODE_MIN_WIDTH : normalizeWidth / board.viewport.zoom;
    const newHeight = height / board.viewport.zoom;

    return { width: newWidth, height: newHeight };
};

export const setTopic = (board: PlaitBoard, element: MindElement, topic: Element, width: number, height: number) => {
    const newElement = {
        data: { topic },
        ...normalizeWidthAndHeight(board, width, height)
    } as MindElement;
    if (MindElement.hasEmojis(element)) {
        newElement.data.emojis = element.data.emojis;
    }
    const path = PlaitBoard.findPath(board, element);
    Transforms.setNode(board, newElement, path);
};

export const setTopicSize = (board: PlaitBoard, element: MindElement, width: number, height: number) => {
    const newElement = {
        ...normalizeWidthAndHeight(board, width, height)
    };
    if (element.width !== newElement.width || element.height !== newElement.height) {
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
