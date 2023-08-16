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
    getSelectedElements,
    PlaitElement,
    setClipboardDataByMedia,
    getClipboardDataByMedia,
    RectangleClient
} from '@plait/core';
import { MindElement } from '../interfaces';
import { ImageData } from '../interfaces/element-data';
import { buildImage, getSelectedImageElement, setImageFocus } from '../utils/node/image';
import { isHitImage, temporaryDisableSelection } from '../utils';
import { MindTransforms } from '../transforms';
import { acceptImageTypes } from '../constants/image';
import { MediaKeys } from '@plait/common';

export const withNodeImage = (board: PlaitBoard) => {
    const { keydown, pointerDown, globalPointerUp, setFragment, insertFragment, deleteFragment } = board;

    board.pointerDown = (event: PointerEvent) => {
        const selectedImageElement = getSelectedImageElement(board);
        if (PlaitBoard.isReadonly(board) || !isMainPointer(event) || !PlaitBoard.isPointer(board, PlaitPointerType.selection)) {
            if (selectedImageElement) {
                setImageFocus(board, selectedImageElement, false);
            }
            pointerDown(event);
            return;
        }

        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        const range = { anchor: point, focus: point };
        const hitImageElements = getHitElements(
            board,
            { ranges: [range] },
            (value: PlaitElement) => MindElement.isMindElement(board, value) && MindElement.hasImage(value)
        );
        const hasImage = hitImageElements.length;
        const hitImage = hasImage && isHitImage(board, hitImageElements[0] as MindElement<ImageData>, range);
        if (selectedImageElement && hitImage && hitImageElements[0] === selectedImageElement) {
            temporaryDisableSelection(board as PlaitOptionsBoard);
            pointerDown(event);
            return;
        }

        if (selectedImageElement) {
            setImageFocus(board, selectedImageElement, false);
        }

        if (hitImage) {
            temporaryDisableSelection(board as PlaitOptionsBoard);
            setImageFocus(board, hitImageElements[0] as MindElement, true);
        }

        pointerDown(event);
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

    board.globalPointerUp = (event: PointerEvent) => {
        if (PlaitBoard.isFocus(board)) {
            const isInBoard = event.target instanceof Node && PlaitBoard.getBoardContainer(board).contains(event.target);
            const selectedImageElement = getSelectedImageElement(board);

            // Clear image selection when mouse board outside area
            if (selectedImageElement && !isInBoard) {
                setImageFocus(board, selectedImageElement, false);
            }
        }
        globalPointerUp(event);
    };

    board.setFragment = (data: DataTransfer | null, rectangle: RectangleClient | null) => {
        const selectedImageElement = getSelectedImageElement(board);
        if (selectedImageElement) {
            setClipboardDataByMedia(data, selectedImageElement.data.image!, MediaKeys.image);
            return;
        }

        setFragment(data, rectangle);
    };

    board.deleteFragment = (data: DataTransfer | null) => {
        const selectedImageElement = getSelectedImageElement(board);

        if (selectedImageElement) {
            MindTransforms.removeImage(board, selectedImageElement as MindElement<ImageData>);
        }

        deleteFragment(data);
    };

    board.insertFragment = (data: DataTransfer | null, targetPoint: Point) => {
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

        const imageItem = getClipboardDataByMedia(data, MediaKeys.image);
        if (imageItem && (isSingleSelection || isSelectedImage)) {
            const selectedElement = (selectedElements[0] || getSelectedImageElement(board)) as MindElement;
            MindTransforms.setImage(board, selectedElement, imageItem);
            return;
        }

        insertFragment(data, targetPoint);
    };

    return board;
};
