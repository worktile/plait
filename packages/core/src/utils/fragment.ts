import { PlaitBoard, PlaitElement, Point, RectangleClient } from '../interfaces';
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

export const duplicateElements = (board: PlaitBoard, rectangle?: RectangleClient, point?: Point, element?: PlaitElement[]) => {
    let targetRectangle = rectangle;
    if (!targetRectangle) {
        const selectedElements = getSelectedElements(board);
        targetRectangle = getRectangleByElements(board, selectedElements, false);
    }
    const clipboardContext = board.buildFragment(null, targetRectangle, 'copy', element);
    const stringifiedContext = clipboardContext && JSON.stringify(clipboardContext);
    const clonedContext = stringifiedContext && JSON.parse(stringifiedContext);
    clonedContext &&
        board.insertFragment(
            {
                ...clonedContext,
                text: undefined
            },
            point || [targetRectangle.x + targetRectangle.width / 2, targetRectangle.y + targetRectangle.height / 2]
        );
};
