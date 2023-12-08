import { Path, PlaitBoard, Transforms } from '@plait/core';
import { LineHandleKey, LineMarkerType, LineText, MemorizeKey, PlaitLine } from '../interfaces';
import { memorizeLatest } from '@plait/common';

export const resizeLine = (board: PlaitBoard, options: Partial<PlaitLine>, path: Path) => {
    Transforms.setNode(board, options, path);
};

export const setLineTexts = (board: PlaitBoard, element: PlaitLine, texts: LineText[]) => {
    const path = PlaitBoard.findPath(board, element);
    Transforms.setNode(board, { texts }, path);
};

export const removeLineText = (board: PlaitBoard, element: PlaitLine, index: number) => {
    const path = PlaitBoard.findPath(board, element);
    const texts = element.texts?.length ? [...element.texts] : [];
    const newTexts = [...texts];
    newTexts.splice(index, 1);
    Transforms.setNode(board, { texts: newTexts }, path);
};

export const setLineMark = (board: PlaitBoard, element: PlaitLine, handleKey: LineHandleKey, marker: LineMarkerType) => {
    const path = PlaitBoard.findPath(board, element);
    let handle = handleKey === LineHandleKey.source ? element.source : element.target;
    handle = { ...handle, marker };
    memorizeLatest(MemorizeKey.line, handleKey, marker);
    Transforms.setNode(board, { [handleKey]: handle }, path);
};
