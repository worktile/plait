import { PlaitBoard, PlaitElement } from '../interfaces';
import { getRectangleByElements } from './element';
import { getSelectedElements } from './selected-element';

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
