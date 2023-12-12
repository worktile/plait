import { PlaitElement } from '@plait/core';
import { BasicShapes, MemorizeKey, PlaitDrawElement } from '../interfaces';
import { getMemorizedLatest } from '@plait/common';
import { DrawPointerType } from '../constants';

export const getMemorizeKey = (element: PlaitElement) => {
    let key = '';
    switch (true) {
        case PlaitDrawElement.isText(element): {
            key = MemorizeKey.text;
            break;
        }
        case PlaitDrawElement.isBaseShape(element): {
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
    return getMemorizedLatest(MemorizeKey.line) || {};
};

export const getMemorizedLatestByPointer = (pointer: DrawPointerType) => {
    let memorizeKey = '';
    if (PlaitDrawElement.isBaseShape({ shape: pointer })) {
        memorizeKey = pointer === BasicShapes.text ? MemorizeKey.text : MemorizeKey.basicShape;
    } else {
        memorizeKey = MemorizeKey.flowchart;
    }
    return getMemorizedLatest(memorizeKey) || {};
};
