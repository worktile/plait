import { PropertyTransforms } from '@plait/common';
import { PlaitBoard } from '@plait/core';
import { getMemorizeKey } from '../utils/memorize';

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
