import { PropertyTransforms, memorizeLatest } from '@plait/common';
import { PlaitBoard } from '@plait/core';
import { getSelectedDrawElements } from '@plait/draw';
import { MemorizeKey, PlaitDrawElement } from '../interfaces';

export const setStrokeColor = (board: PlaitBoard, strokeColor: string) => {
    setMemorize(board, 'strokeColor', strokeColor);
    PropertyTransforms.setStrokeColor(board, strokeColor);
};

export const setStrokeWidth = (board: PlaitBoard, strokeWidth: number) => {
    setMemorize(board, 'strokeWidth', strokeWidth);
    PropertyTransforms.setStrokeWidth(board, strokeWidth);
};

export const setFillColor = (board: PlaitBoard, fill: string) => {
    setMemorize(board, 'fill', fill);
    PropertyTransforms.setFillColor(board, fill);
};

export const setStrokeStyle = (board: PlaitBoard, strokeStyle: string) => {
    setMemorize(board, 'strokeStyle', strokeStyle);
    PropertyTransforms.setStrokeStyle(board, strokeStyle);
};

export const setMemorize = (board: PlaitBoard, propertyKey: string, value: string | number) => {
    const element = getSelectedDrawElements(board)[0];
    if (!element) return;
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
            key = MemorizeKey.flowchart;
            break;
        }
    }
    memorizeLatest(key, propertyKey, value);
};
