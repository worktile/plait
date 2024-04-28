import { PlaitBoard, PlaitElement, Point } from '../interfaces';
import { WritableClipboardOperationType } from './clipboard';
import { setClipboardData } from './clipboard/clipboard';
import { getRectangleByElements } from './element';
import { getSelectedElements } from './selected-element';

export const deleteFragment = (board: PlaitBoard) => {
    const elements = board.getDeletedFragment([]);
    board.deleteFragment(elements);
};

export const setFragment = (board: PlaitBoard, operationType: WritableClipboardOperationType, clipboardData: DataTransfer | null) => {
    const selectedElements = getSelectedElements(board);
    const rectangle = getRectangleByElements(board, selectedElements, false);
    const clipboardContext = board.buildFragment(null, rectangle, operationType);
    clipboardContext && setClipboardData(clipboardData, clipboardContext);
};

export const duplicateElements = (board: PlaitBoard, elements?: PlaitElement[], point?: Point) => {
    const targetElements = elements?.length ? elements : getSelectedElements(board);
    const targetRectangle = getRectangleByElements(board, targetElements, false);
    const clipboardContext = board.buildFragment(null, targetRectangle, WritableClipboardOperationType.duplicate, targetElements);
    const stringifiedContext = clipboardContext && JSON.stringify(clipboardContext);
    const clonedContext = stringifiedContext && JSON.parse(stringifiedContext);
    clonedContext &&
        board.insertFragment(
            {
                ...clonedContext,
                text: undefined
            },
            point || [targetRectangle.x + targetRectangle.width / 2, targetRectangle.y + targetRectangle.height / 2],
            WritableClipboardOperationType.duplicate
        );
};
