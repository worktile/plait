import { addSelectedElement, clearSelectedElement, idCreator, Path, PlaitBoard, Transforms } from '@plait/core';
import { Node } from 'slate';
import { NODE_MIN_WIDTH } from '../constants/node-rule';
import { MindElement } from '../interfaces/element';
import { TEXT_DEFAULT_HEIGHT } from '@plait/richtext';
import { startTopicEdit } from './node/common';
import { createMindElement, INHERIT_ATTRIBUTE_KEYS, InheritAttribute } from './node/create-node';
import { MindNode } from '../interfaces/node';

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

export const extractNodesText = (node: MindElement) => {
    let str = '';
    if (node) {
        str += Node.string(node.data.topic.children[0]) + ' ';
        for (const childNode of node.children) {
            str += extractNodesText(childNode);
        }
    }
    return str;
};

// layoutLevel 用来表示插入兄弟节点还是子节点
export const insertMindElement = (board: PlaitBoard, inheritNode: MindElement, path: Path) => {
    const newNode: InheritAttribute = {};
    if (!inheritNode.isRoot) {
        INHERIT_ATTRIBUTE_KEYS.forEach(attr => {
            (newNode as any)[attr] = inheritNode[attr];
        });

        delete newNode.layout;
    }

    const newElement = createMindElement('', NODE_MIN_WIDTH, TEXT_DEFAULT_HEIGHT, newNode);

    Transforms.insertNode(board, newElement, path);
    clearSelectedElement(board);
    addSelectedElement(board, newElement);
    setTimeout(() => {
        startTopicEdit(newElement);
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
