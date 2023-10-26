import { PlaitBoard, getSelectedElements } from '@plait/core';
import { PlaitDrawElement, PlaitGeometry, PlaitLine } from '../interfaces';
import { PlaitImage } from '../interfaces/image';

export const getSelectedDrawElements = (board: PlaitBoard) => {
    const selectedElements = getSelectedElements(board).filter(value => PlaitDrawElement.isDrawElement(value)) as PlaitDrawElement[];
    return selectedElements;
};

export const getSelectedGeometryElements = (board: PlaitBoard) => {
    const selectedElements = getSelectedElements(board).filter(value => PlaitDrawElement.isGeometry(value)) as PlaitGeometry[];
    return selectedElements;
};

export const getSelectedLineElements = (board: PlaitBoard) => {
    const selectedElements = getSelectedElements(board).filter(value => PlaitDrawElement.isLine(value)) as PlaitLine[];
    return selectedElements;
};

export const getSelectedImageElements = (board: PlaitBoard) => {
    const selectedElements = getSelectedElements(board).filter(value => PlaitDrawElement.isImage(value)) as PlaitImage[];
    return selectedElements;
};
