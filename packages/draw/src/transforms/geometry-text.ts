import { PlaitBoard, Transforms } from '@plait/core';
import { Element } from 'slate';
import { PlaitGeometry } from '../interfaces';

export const setText = (board: PlaitBoard, element: PlaitGeometry, text: Element, width: number, height: number) => {
    const newElement = {
        text
    };
    const path = board.children.findIndex(child => child === element);
    Transforms.setNode(board, newElement, [path]);
};
