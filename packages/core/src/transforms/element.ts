import { PlaitBoard } from '../interfaces/board';
import { PlaitElement } from '../interfaces/element';
import { removeSelectedElement } from '../utils/selected-element';
import { removeNode } from './node';

export const removeElements = (board: PlaitBoard, elements: PlaitElement[]) => {
    elements
        .map(element => {
            const path = PlaitBoard.findPath(board, element);
            const ref = board.pathRef(path);
            return () => {
                removeNode(board, ref.current!);
                ref.unref();
                removeSelectedElement(board, element, true);
            };
        })
        .forEach(action => {
            action();
        });
};

export const CoreTransforms = {
    removeElements
};
