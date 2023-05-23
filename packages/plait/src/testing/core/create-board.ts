import { PlaitBoardOptions, PlaitElement, PlaitPlugin } from '../../interfaces';
import { createBoard } from '../../plugins/create-board';

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
    return board;
};
