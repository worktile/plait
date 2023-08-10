import { PlaitBoard, Transforms } from '@plait/core';
import { Element } from 'slate';
import { PlaitBaseGeometry } from '../interfaces';

const setText = (board: PlaitBoard, element: PlaitBaseGeometry, topic: Element, width: number, height: number) => {
    const newElement = {
        topic
    };
    const path = board.children.findIndex(child => child === element);
    Transforms.setNode(board, newElement, [path]);
};

export const DrawTransform = {
    setText
};
