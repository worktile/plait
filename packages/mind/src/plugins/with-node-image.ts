import {
    PlaitBoard,
    getHitElements,
    isMainPointer,
    toPoint,
    transformPoint,
    PlaitOptionsBoard,
    hotkeys,
    clearSelectedElement,
    PlaitPointerType
} from '@plait/core';
import { MindElement } from '../interfaces';
import { MindTransforms, isHitImage, temporaryDisableSelection } from '../public-api';
import { ImageData } from '../interfaces/element-data';
import { setImageFocus } from '../utils/node/image';

export const withNodeImage = (board: PlaitBoard) => {
    let selectedImageElement: MindElement<ImageData> | null = null;

    const { keydown, mousedown } = board;

    board.mousedown = (event: MouseEvent) => {
        if (PlaitBoard.isReadonly(board) || !isMainPointer(event) || !PlaitBoard.isPointer(board, PlaitPointerType.selection)) {
            mousedown(event);
            return;
        }
        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        const range = { anchor: point, focus: point };
        const hitElements = getHitElements(board, { ranges: [range] });
        const hasImage = hitElements.length && MindElement.hasImage(hitElements[0] as MindElement);
        const hitImage = hasImage && isHitImage(board, hitElements[0] as MindElement<ImageData>, range);

        if (hitImage) {
            temporaryDisableSelection(board as PlaitOptionsBoard);

            if (selectedImageElement) {
                setImageFocus(selectedImageElement, false);
            }

            selectedImageElement = hitElements[0] as MindElement<ImageData>;
            setImageFocus(selectedImageElement, true);

            clearSelectedElement(board);
        } else if (selectedImageElement && !hitImage) {
            setImageFocus(selectedImageElement, false);
            selectedImageElement = null;
        }

        mousedown(event);
    };

    board.keydown = (event: KeyboardEvent) => {
        if (!PlaitBoard.isReadonly(board) && selectedImageElement && (hotkeys.isDeleteBackward(event) || hotkeys.isDeleteForward(event))) {
            MindTransforms.removeImage(board, selectedImageElement);
            selectedImageElement = null;
            return;
        }

        keydown(event);
    };

    return board;
};
