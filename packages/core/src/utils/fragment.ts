import { PlaitBoard, PlaitElement } from '../interfaces';
import { setClipboardData } from './clipboard/clipboard';
import { getRectangleByElements } from './element';
import { getSelectedElements } from './selected-element';

export const deleteFragment = (board: PlaitBoard) => {
    const elements = board.getDeletedFragment([]);
    board.deleteFragment(elements);
};

export const setFragment = (board: PlaitBoard, type: 'copy' | 'cut', clipboardData: DataTransfer | null) => {
    const selectedElements = getSelectedElements(board);
    const rectangle = getRectangleByElements(board, selectedElements, false);
    const clipboardContext = board.buildFragment(null, rectangle, type);
    clipboardContext && setClipboardData(clipboardData, clipboardContext);
};


export const duplicateElements = (board: PlaitBoard, elements?: PlaitElement[]) => {
    const selectedElements = elements || getSelectedElements(board);
    const rectangle = getRectangleByElements(board, selectedElements, false);
    const clipboardContext = board.buildFragment(null, rectangle, 'copy');
    clipboardContext &&
        board.insertFragment(
            {
                ...clipboardContext,
                text: undefined
            },
            [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height / 2]
        );
};
