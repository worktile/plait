import { getRectangleByElements, getSelectedElements, PlaitBoard, PlaitElement } from '@plait/core';

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
            [rectangle.x + rectangle.width, rectangle.y + rectangle.height]
        );
};
