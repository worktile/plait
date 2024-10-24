import { PlaitBoard, PlaitElement, getSelectedElements } from '@plait/core';
import { PlaitArrowLine, PlaitDrawElement, PlaitGeometry, PlaitSwimlane, PlaitVectorLine } from '../interfaces';
import { PlaitImage } from '../interfaces/image';
import { PlaitTable, PlaitTableElement } from '../interfaces/table';

export const getSelectedDrawElements = (board: PlaitBoard, elements?: PlaitElement[]) => {
    const selectedElements = elements?.length ? elements : getSelectedElements(board);
    return selectedElements.filter(value => PlaitDrawElement.isDrawElement(value)) as PlaitDrawElement[];
};

export const getSelectedGeometryElements = (board: PlaitBoard) => {
    const selectedElements = getSelectedElements(board).filter(value => PlaitDrawElement.isGeometry(value)) as PlaitGeometry[];
    return selectedElements;
};

export const getSelectedArrowLineElements = (board: PlaitBoard) => {
    const selectedElements = getSelectedElements(board).filter(value => PlaitDrawElement.isArrowLine(value)) as PlaitArrowLine[];
    return selectedElements;
};

export const getSelectedVectorLineElements = (board: PlaitBoard) => {
    const selectedElements = getSelectedElements(board).filter(value => PlaitDrawElement.isVectorLine(value)) as PlaitVectorLine[];
    return selectedElements;
};

export const getSelectedImageElements = (board: PlaitBoard) => {
    const selectedElements = getSelectedElements(board).filter(value => PlaitDrawElement.isImage(value)) as PlaitImage[];
    return selectedElements;
};

export const isSingleSelectSwimlane = (board: PlaitBoard) => {
    const selectedElements = getSelectedElements(board);
    return selectedElements && selectedElements.length === 1 && PlaitDrawElement.isSwimlane(selectedElements[0]);
};

export const getSelectedSwimlane = (board: PlaitBoard): PlaitSwimlane => {
    const selectedElements = getSelectedElements(board);
    return selectedElements.find(item => PlaitDrawElement.isSwimlane(item)) as PlaitSwimlane;
};
