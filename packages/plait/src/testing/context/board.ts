import { PlaitBoard, PlaitBoardOptions, PlaitElement, PlaitNode, PlaitPlugin } from '../../interfaces';
import { createBoard } from '../../plugins/create-board';
import { NODE_TO_INDEX, NODE_TO_PARENT } from '../../utils/weak-maps';

/**
 * 1.create board instance
 * 2.build fake node weak map
 */
export const createTestingBoard = (
    plugins: PlaitPlugin[],
    children: PlaitElement[],
    options: PlaitBoardOptions = { readonly: false, hideScrollbar: true }
) => {
    let board = createBoard(children, options);
    plugins.forEach(plugin => {
        board = plugin(board);
    });
    buildNodeWeakMap(board);
    return board;
};

export const buildNodeWeakMap = (object: PlaitNode | PlaitBoard) => {
    const children = object.children || [];
    children.forEach((value, index: number) => {
        NODE_TO_PARENT.set(value, object);
        NODE_TO_INDEX.set(value, index);
        buildNodeWeakMap(value);
    });
};
