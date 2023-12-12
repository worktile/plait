import { PlaitElement } from '@plait/core';
import { BasicShapes, MemorizeKey, PlaitDrawElement } from '../interfaces';
import { getMemorizedLatest, memorizeLatest } from '@plait/common';
import { DrawPointerType } from '../constants';
import { BaseOperation, BaseSetNodeOperation, Node } from 'slate';

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
        case PlaitDrawElement.isLine(element): {
            key = MemorizeKey.line;
            break;
        }
    }
    return key;
};

export const getLineMemorizedLatest = () => {
    const properties = getMemorizedLatest(MemorizeKey.line);
    delete properties?.text;
    return properties || {};
};

export const getMemorizedLatestByPointer = (pointer: DrawPointerType) => {
    let memorizeKey = '';
    if (PlaitDrawElement.isBasicShape({ shape: pointer })) {
        memorizeKey = pointer === BasicShapes.text ? MemorizeKey.text : MemorizeKey.basicShape;
    } else {
        memorizeKey = MemorizeKey.flowchart;
    }
    const properties = { ...getMemorizedLatest(memorizeKey) } || {};
    const textProperties = properties.text || {};
    delete properties.text;
    return { textProperties, geometryProperties: properties };
};

export const memorizeLatestText = (element: PlaitDrawElement, operations: BaseOperation[]) => {
    const memorizeKey = getMemorizeKey(element);
    let textMemory = getMemorizedLatest(memorizeKey)?.text || {};
    const setNodeOperation = operations.find(operation => operation.type === 'set_node');
    if (setNodeOperation) {
        const newProperties = (setNodeOperation as BaseSetNodeOperation).newProperties;
        textMemory = { ...textMemory, ...newProperties };
        memorizeLatest(memorizeKey, 'text', textMemory);
    }
};
