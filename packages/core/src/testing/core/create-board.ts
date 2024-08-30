import { PlaitBoardOptions, PlaitElement, PlaitPlugin } from '../../interfaces';
import { createBoard } from '../../plugins/create-board';
import { KEY_TO_ELEMENT_MAP } from '../../utils';

/**
 * 1.create board instance
 * 2.build fake node weak map
 */
export const createTestingBoard = (
    plugins: PlaitPlugin[],
    children: PlaitElement[],
    options: PlaitBoardOptions = { readonly: false, hideScrollbar: true, disabledScrollOnNonFocus: false }
) => {
    let board = createBoard(children, options);
    plugins.forEach(plugin => {
        board = plugin(board);
    });
    KEY_TO_ELEMENT_MAP.set(board, new Map());
    return board;
};
