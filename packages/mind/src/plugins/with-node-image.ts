import {
    PlaitBoard,
    getHitElements,
    isMainPointer,
    toPoint,
    transformPoint,
    PlaitOptionsBoard,
    hotkeys,
    clearSelectedElement,
    PlaitPointerType,
    addSelectedElement,
    ATTACHED_ELEMENT_CLASS_NAME
} from '@plait/core';
import { MindElement } from '../interfaces';
import { ImageData } from '../interfaces/element-data';
import { getSelectedImageElement, setImageFocus } from '../utils/node/image';
import { isHitImage, temporaryDisableSelection } from '../utils';
import { MindTransforms } from '../transforms';

export const withNodeImage = (board: PlaitBoard) => {
    const { keydown, mousedown, globalMouseup } = board;

    board.mousedown = (event: MouseEvent) => {
        const selectedImageElement = getSelectedImageElement(board);
        if (PlaitBoard.isReadonly(board) || !isMainPointer(event) || !PlaitBoard.isPointer(board, PlaitPointerType.selection)) {
            if (selectedImageElement) {
                setImageFocus(board, selectedImageElement, false);
            }
            mousedown(event);
            return;
        }

        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        const range = { anchor: point, focus: point };
        const hitElements = getHitElements(board, { ranges: [range] });
        const hasImage = hitElements.length && MindElement.hasImage(hitElements[0] as MindElement);
        const hitImage = hasImage && isHitImage(board, hitElements[0] as MindElement<ImageData>, range);

        if (selectedImageElement && hitImage && hitElements[0] === selectedImageElement) {
            temporaryDisableSelection(board as PlaitOptionsBoard);
            mousedown(event);
            return;
        }

        if (selectedImageElement) {
            setImageFocus(board, selectedImageElement, false);
        }

        if (hitImage) {
            temporaryDisableSelection(board as PlaitOptionsBoard);

            setImageFocus(board, hitElements[0] as MindElement, true);
        }

        mousedown(event);
    };

    board.keydown = (event: KeyboardEvent) => {
        const selectedImageElement = getSelectedImageElement(board);

        if (!PlaitBoard.isReadonly(board) && selectedImageElement && (hotkeys.isDeleteBackward(event) || hotkeys.isDeleteForward(event))) {
            addSelectedElement(board, selectedImageElement);
            MindTransforms.removeImage(board, selectedImageElement as MindElement<ImageData>);
            return;
        }

        keydown(event);
    };

    board.globalMouseup = (event: MouseEvent) => {
        if (PlaitBoard.isFocus(board)) {
            const isInBoard = event.target instanceof Node && PlaitBoard.getBoardContainer(board).contains(event.target);
            const selectedImageElement = getSelectedImageElement(board);

            // Clear image selection when mouse board outside area
            if (selectedImageElement && !isInBoard) {
                setImageFocus(board, selectedImageElement, false);
            }
        }
        globalMouseup(event);
    };

    return board;
};
