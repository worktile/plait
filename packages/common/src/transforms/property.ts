import { Path, PlaitBoard, PlaitElement, PlaitPluginElementComponent, Transforms, getSelectedElements } from '@plait/core';
import { setProperty } from './common';

const setStrokeStyle = (board: PlaitBoard, strokeStyle: string) => {
    setProperty(board, { strokeStyle });
};

const setFillColor = (board: PlaitBoard, fill: string) => {
    setProperty(board, { fill });
};

const setStrokeColor = (board: PlaitBoard, strokeColor: string) => {
    setProperty(board, { strokeColor });
};

const setStrokeWidth = (board: PlaitBoard, strokeWidth: number) => {
    setProperty(board, { strokeWidth });
};

export const PropertyTransforms = {
    setFillColor,
    setStrokeStyle,
    setProperty,
    setStrokeWidth,
    setStrokeColor
};
