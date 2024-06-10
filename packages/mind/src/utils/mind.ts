import { addSelectedElement, clearSelectedElement, idCreator, Path, PlaitBoard, Transforms } from '@plait/core';
import { MindElement, PlaitMind } from '../interfaces/element';
import { editTopic } from './node/common';
import { createMindElement, INHERIT_ATTRIBUTE_KEYS, InheritAttribute } from './node/create-node';
import { MindNode } from '../interfaces/node';
import { PlaitMindBoard } from '../plugins/with-mind.board';
import { ROOT_TOPIC_FONT_SIZE, TOPIC_FONT_SIZE } from '../constants/node-topic-style';
import { TEXT_DEFAULT_HEIGHT } from '@plait/text-plugins';

export const getChildrenCount = (element: MindElement) => {
    const count: number = element.children.reduce((p: number, c: MindElement) => {
        return p + getChildrenCount(c);
    }, 0);
    return count + element.children.length;
};

export const isChildElement = (origin: MindElement, child: MindElement) => {
    let parent = MindElement.findParent(child);
    while (parent) {
        if (parent === origin) {
            return true;
        }
        parent = MindElement.findParent(parent);
    }
    return false;
};

export const getFirstLevelElement = (elements: MindElement[]) => {
    let result: MindElement[] = [];
    elements.forEach(element => {
        const isChild = elements.some(node => {
            return isChildElement(node, element);
        });

        if (!isChild) {
            result.push(element);
        }
    });
    return result;
};

export const isChildRight = (node: MindNode, child: MindNode) => {
    return node.x < child.x;
};

export const isChildUp = (node: MindNode, child: MindNode) => {
    return node.y > child.y;
};

export const copyNewNode = (node: MindElement) => {
    const newNode: MindElement = { ...node };
    newNode.id = idCreator();
    newNode.children = [];

    for (const childNode of node.children) {
        newNode.children.push(copyNewNode(childNode));
    }
    return newNode;
};

export const insertMindElement = (board: PlaitMindBoard, inheritNode: MindElement, path: Path) => {
    const newNode: InheritAttribute = {};
    if (!inheritNode.isRoot) {
        INHERIT_ATTRIBUTE_KEYS.forEach(attr => {
            (newNode as any)[attr] = inheritNode[attr];
        });
        delete newNode.layout;
    }

    const newElement = createMindElement('', TOPIC_FONT_SIZE, TEXT_DEFAULT_HEIGHT, newNode);

    Transforms.insertNode(board, newElement, path);
    clearSelectedElement(board);
    addSelectedElement(board, newElement);
    setTimeout(() => {
        editTopic(newElement);
    });
};

export const findLastChild = (child: MindNode) => {
    let result = child;
    while (result.children.length !== 0) {
        result = result.children[result.children.length - 1];
    }
    return result;
};

export const divideElementByParent = (elements: MindElement[]) => {
    const abstractIncludedGroups = [];
    const parentElements: MindElement[] = [];

    for (let i = 0; i < elements.length; i++) {
        const parent = MindElement.getParent(elements[i]);
        const parentIndex = parentElements.indexOf(parent);
        if (parentIndex === -1) {
            parentElements.push(parent);
            abstractIncludedGroups.push([elements[i]]);
        } else {
            abstractIncludedGroups[parentIndex].push(elements[i]);
        }
    }
    return { parentElements, abstractIncludedGroups };
};

export const getDefaultMindElementFontSize = (board: PlaitBoard, element: MindElement) => {
    if (PlaitMind.isMind(element)) {
        return ROOT_TOPIC_FONT_SIZE;
    }
    if (MindElement.isMindElement(board, element)) {
        return TOPIC_FONT_SIZE;
    }
    throw new Error('can not find default font-size');
};
