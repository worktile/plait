import {
    PlaitBoard,
    getHitElements,
    isMainPointer,
    toPoint,
    transformPoint,
    PlaitOptionsBoard,
    hotkeys,
    PlaitPointerType,
    addSelectedElement,
    Point,
    getSelectedElements
} from '@plait/core';
import { MindElement } from '../interfaces';
import { ImageData } from '../interfaces/element-data';
import { buildImage, getSelectedImageElement, setImageFocus } from '../utils/node/image';
import { isHitImage, temporaryDisableSelection } from '../utils';
import { MindTransforms } from '../transforms';
import { acceptImageTypes } from '../constants/image';
import { getImageItemFromClipboard, setClipboardDataByImage } from '../utils/clipboard';

export const withNodeImage = (board: PlaitBoard) => {
    const { keydown, mousedown, globalMouseup, setFragment, insertFragment, deleteFragment } = board;

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

    board.setFragment = (data: DataTransfer | null) => {
        const selectedImageElement = getSelectedImageElement(board);
        if (selectedImageElement) {
            setClipboardDataByImage(data, selectedImageElement.data.image!);
            return;
        }

        setFragment(data);
    };

    board.deleteFragment = (data: DataTransfer | null) => {
        const selectedImageElement = getSelectedImageElement(board);

        if (selectedImageElement) {
            MindTransforms.removeImage(board, selectedImageElement as MindElement<ImageData>);
        }

        deleteFragment(data);
    };

    board.insertFragment = (data: DataTransfer | null, targetPoint?: Point) => {
        const selectedElements = getSelectedElements(board);
        const isSelectedImage = !!getSelectedImageElement(board);
        const isSingleSelection = selectedElements.length === 1 && MindElement.isMindElement(board, selectedElements[0]);

        if (data?.files.length && (isSingleSelection || isSelectedImage)) {
            const selectedElement = (selectedElements[0] || getSelectedImageElement(board)) as MindElement;
            const acceptImageArray = acceptImageTypes.map(type => 'image/' + type);
            if (acceptImageArray.includes(data?.files[0].type)) {
                const imageFile = data.files[0];
                buildImage(board, selectedElement as MindElement, imageFile);
                return;
            }
        }

        const imageItem = getImageItemFromClipboard(data);
        if (imageItem && (isSingleSelection || isSelectedImage)) {
            const selectedElement = (selectedElements[0] || getSelectedImageElement(board)) as MindElement;
            MindTransforms.setImage(board, selectedElement, imageItem);
        }

        insertFragment(data, targetPoint);
    };

    return board;
};
