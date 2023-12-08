import { PropertyTransforms } from '@plait/common';
import { PlaitBoard, PlaitElement } from '@plait/core';
import { MemorizeKey, PlaitDrawElement } from '../interfaces';

export const setStrokeColor = (board: PlaitBoard, strokeColor: string) => {
    PropertyTransforms.setProperty(board, { strokeColor }, { getMemorizeKey });
};

export const setStrokeWidth = (board: PlaitBoard, strokeWidth: number) => {
    PropertyTransforms.setProperty(board, { strokeWidth }, { getMemorizeKey });
};

export const setFillColor = (board: PlaitBoard, fill: string) => {
    PropertyTransforms.setProperty(board, { fill }, { getMemorizeKey });
};

export const setStrokeStyle = (board: PlaitBoard, strokeStyle: string) => {
    PropertyTransforms.setProperty(board, { strokeStyle }, { getMemorizeKey });
};

export const getMemorizeKey = (element: PlaitElement) => {
    let key = '';
    switch (true) {
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
