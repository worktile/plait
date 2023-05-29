import { Element, Path } from 'slate';
import { MindElement } from '../interfaces/element';
import { NODE_MIN_WIDTH } from '../constants/node-rule';
import { PlaitBoard, PlaitNode, Transforms } from '@plait/core';
import { changeRightNodeCount, getFirstLevelElement, isInRightBranchOfStandardLayout } from '../utils/mind';
import { AbstractNode } from '@plait/layouts';
import { getRelativeStartEndByAbstractRef, getValidAbstractRefs } from '../utils/abstract/common';
import { adjustAbstractToNode } from '../utils/node/adjust-node';

export const setTopic = (board: PlaitBoard, element: MindElement, topic: Element, width: number, height: number) => {
    const newElement = {
        data: { topic },
        width: width < NODE_MIN_WIDTH * board.viewport.zoom ? NODE_MIN_WIDTH : width / board.viewport.zoom,
        height: height / board.viewport.zoom
    } as MindElement;
    if (MindElement.hasEmojis(element)) {
        newElement.data.emojis = element.data.emojis;
    }
    const path = PlaitBoard.findPath(board, element);
    Transforms.setNode(board, newElement, path);
};

export const setTopicSize = (board: PlaitBoard, element: MindElement, width: number, height: number) => {
    const newElement = {
        width: width < NODE_MIN_WIDTH * board.viewport.zoom ? NODE_MIN_WIDTH : width / board.viewport.zoom,
        height: height / board.viewport.zoom
    };
    const path = PlaitBoard.findPath(board, element);
    Transforms.setNode(board, newElement, path);
};

export const removeElements = (board: PlaitBoard, elements: MindElement[]) => {
    const deletableElements = getFirstLevelElement(elements).reverse();

    //翻转，从下到上修改，防止找不到 path
    deletableElements
        .map(element => {
            const path = PlaitBoard.findPath(board, element);
            return () => {
                if (isInRightBranchOfStandardLayout(element)) {
                    changeRightNodeCount(board, path.slice(0, 1), -1);
                }
                Transforms.removeNode(board, path);
            };
        })
        .forEach(action => {
            action();
        });
};

export const insertNodes = (board: PlaitBoard, elements: MindElement[], path: Path) => {
    const validAbstractRefs = getValidAbstractRefs(board, elements);
    elements = elements
        .filter(element => !validAbstractRefs.some(refs => refs.abstract === element))
        .map(element => {
            if (AbstractNode.isAbstract(element)) {
                return adjustAbstractToNode(element);
            }
            return element;
        });

    const pathRef = board.pathRef(path);
    elements.forEach(element => {
        if (pathRef.current) {
            Transforms.insertNode(board, element, pathRef.current);
        }
    });

    if (validAbstractRefs.length) {
        const parent = PlaitNode.get(board, Path.parent(path));
        const abstractPath = [...Path.parent(path), parent.children?.length!];
        const abstractPathRef = board.pathRef(abstractPath);
        const abstracts = validAbstractRefs.map(refs => {
            const { start, end } = getRelativeStartEndByAbstractRef(refs, elements);
            return {
                ...refs.abstract,
                start: start + path[path.length - 1],
                end: end + path[path.length - 1]
            };
        });

        abstracts.forEach(element => {
            if (abstractPathRef.current) {
                Transforms.insertNode(board, element, abstractPathRef.current);
            }
        });
        abstractPathRef.unref();
    }
    pathRef.unref();

    Transforms.setSelectionWithTemporaryElements(board, elements);
};
