import { PlaitBoard, PlaitElement, getSelectedElements } from '@plait/core';
import { PlaitDrawElement, PlaitGeometry, PlaitLine } from '../interfaces';
import { PlaitImage } from '../interfaces/image';

export const getSelectedDrawElements = (board: PlaitBoard, elements?: PlaitElement[]) => {
    const selectedElements = elements || getSelectedElements(board);
    return selectedElements.filter(value => PlaitDrawElement.isDrawElement(value)) as PlaitDrawElement[];
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
