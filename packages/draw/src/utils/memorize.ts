import { PlaitBoard, PlaitElement } from '@plait/core';
import { BasicShapes, GeometryShapes, MemorizeKey, PlaitDrawElement } from '../interfaces';
import { getMemorizedLatest, memorizeLatest } from '@plait/common';
import { DrawPointerType } from '../constants';
import { BaseOperation, BaseSetNodeOperation, Node } from 'slate';

const SHAPE_MAX_LENGTH = 6;
const memorizedShape: WeakMap<PlaitBoard, GeometryShapes[]> = new WeakMap();

export const getMemorizeKey = (element: PlaitElement) => {
    let key = '';
    switch (true) {
        case PlaitDrawElement.isText(element): {
            key = MemorizeKey.text;
            break;
        }
        case PlaitDrawElement.isBasicShape(element): {
            key = MemorizeKey.basicShape;
            break;
        }
        case PlaitDrawElement.isFlowchart(element): {
            key = MemorizeKey.flowchart;
            break;
        }
        case PlaitDrawElement.isArrowLine(element): {
            key = MemorizeKey.arrowLine;
            break;
        }
        case PlaitDrawElement.isUML(element): {
            key = MemorizeKey.UML;
        }
    }
    return key;
};

export const getLineMemorizedLatest = () => {
    const properties = getMemorizedLatest(MemorizeKey.arrowLine);
    return { ...properties } || {};
};

export const getMemorizedLatestByPointer = (pointer: DrawPointerType) => {
    let memorizeKey = '';
    if (PlaitDrawElement.isBasicShape({ shape: pointer })) {
        memorizeKey = pointer === BasicShapes.text ? MemorizeKey.text : MemorizeKey.basicShape;
    } else if (PlaitDrawElement.isUML({ shape: pointer })) {
        memorizeKey = MemorizeKey.UML;
    } else {
        memorizeKey = MemorizeKey.flowchart;
    }
    const properties = { ...getMemorizedLatest(memorizeKey) } || {};
    const textProperties = { ...properties.text } || {};
    delete properties.text;
    return { textProperties, geometryProperties: properties };
};

export const memorizeLatestText = <T extends PlaitElement = PlaitDrawElement>(element: T, operations: BaseOperation[]) => {
    const memorizeKey = getMemorizeKey(element);
    let textMemory = getMemorizedLatest(memorizeKey)?.text || {};
    const setNodeOperation = operations.find(operation => operation.type === 'set_node');
    if (setNodeOperation) {
        const { properties, newProperties } = setNodeOperation as BaseSetNodeOperation;
        for (const key in newProperties) {
            const value = newProperties[key as keyof Partial<Node>];
            if (value == null) {
                delete textMemory[key];
            } else {
                textMemory[key] = value;
            }
        }
        for (const key in properties) {
            if (!newProperties.hasOwnProperty(key)) {
                delete textMemory[key];
            }
        }
        memorizeLatest(memorizeKey, 'text', textMemory);
    }
};

export const memorizeLatestShape = (board: PlaitBoard, shape: GeometryShapes) => {
    const shapes = memorizedShape.has(board) ? memorizedShape.get(board)! : [];
    const shapeIndex = shapes.indexOf(shape);
    if (shape === BasicShapes.text || shapeIndex === 0) {
        return;
    }
    if (shapeIndex !== -1) {
        shapes.splice(shapeIndex, 1);
    } else {
        if (shapes.length === SHAPE_MAX_LENGTH) {
            shapes.pop();
        }
    }
    shapes.unshift(shape);
    memorizedShape.set(board, shapes);
};

export const getMemorizedLatestShape = (board: PlaitBoard) => {
    return memorizedShape.get(board);
};
