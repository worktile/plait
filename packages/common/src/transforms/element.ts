import { PlaitBoard, PlaitElement, Transforms, removeSelectedElement } from '@plait/core';

export const removeElements = (board: PlaitBoard, elements: PlaitElement[]) => {
    elements
        .map(element => {
            const path = PlaitBoard.findPath(board, element);
            const ref = board.pathRef(path);
            return () => {
                Transforms.removeNode(board, ref.current!);
                ref.unref();
                removeSelectedElement(board, element);
            };
        })
        .forEach(action => {
            action();
        });
};
