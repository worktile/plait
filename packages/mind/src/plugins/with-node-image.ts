import {
    PlaitBoard,
    isMainPointer,
    PlaitOptionsBoard,
    hotkeys,
    PlaitPointerType,
    addSelectedElement,
    Point,
    getSelectedElements,
    RectangleClient,
    getHitElementByPoint,
    temporaryDisableSelection,
    WritableClipboardType,
    toHostPoint,
    toViewBoxPoint,
    WritableClipboardContext,
    createClipboardContext,
    ClipboardData
} from '@plait/core';
import { MindElement } from '../interfaces';
import { ImageData } from '../interfaces/element-data';
import { addImageFocus, removeImageFocus } from '../utils/node/image';
import { isHitImage } from '../utils';
import { MindTransforms } from '../transforms';
import { acceptImageTypes, buildImage, getElementOfFocusedImage } from '@plait/common';
import { DEFAULT_MIND_IMAGE_WIDTH } from '../constants';

export const withNodeImage = (board: PlaitBoard) => {
    const { keydown, pointerDown, globalPointerUp, setFragment, insertFragment, deleteFragment } = board;

    board.pointerDown = (event: PointerEvent) => {
        const elementOfFocusedImage = getElementOfFocusedImage(board);
        if (PlaitBoard.isReadonly(board) || !isMainPointer(event) || !PlaitBoard.isPointer(board, PlaitPointerType.selection)) {
            if (elementOfFocusedImage && MindElement.isMindElement(board, elementOfFocusedImage)) {
                removeImageFocus(board, elementOfFocusedImage as MindElement<ImageData>);
            }
            pointerDown(event);
            return;
        }
        const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        const hitElement = getHitElementByPoint(board, point);
        const isHitImageResult =
            hitElement &&
            MindElement.isMindElement(board, hitElement) &&
            MindElement.hasImage(hitElement) &&
            isHitImage(board, hitElement as MindElement<ImageData>, point);
        if (isHitImageResult && elementOfFocusedImage && hitElement === elementOfFocusedImage) {
            temporaryDisableSelection(board as PlaitOptionsBoard);
            pointerDown(event);
            return;
        }
        if (elementOfFocusedImage && MindElement.isMindElement(board, elementOfFocusedImage)) {
            removeImageFocus(board, elementOfFocusedImage as MindElement<ImageData>);
        }
        if (isHitImageResult && hitElement) {
            temporaryDisableSelection(board as PlaitOptionsBoard);
            addImageFocus(board, hitElement as MindElement<ImageData>);
        }
        pointerDown(event);
    };

    board.keydown = (event: KeyboardEvent) => {
        const selectedImageElement = getElementOfFocusedImage(board);
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
            const selectedImageElement = getElementOfFocusedImage(board);
            // Clear image selection when mouse board outside area
            if (selectedImageElement && MindElement.isMindElement(board, selectedImageElement) && !isInBoard) {
                removeImageFocus(board, selectedImageElement as MindElement<ImageData>);
            }
        }
        globalPointerUp(event);
    };

    board.setFragment = (
        data: DataTransfer | null,
        clipboardContext: WritableClipboardContext | null,
        rectangle: RectangleClient | null,
        type: 'copy' | 'cut'
    ) => {
        const selectedImageElement = getElementOfFocusedImage(board) as MindElement<ImageData>;
        if (selectedImageElement) {
            clipboardContext = createClipboardContext(WritableClipboardType.medias, [selectedImageElement.data.image], '');
        }
        setFragment(data, clipboardContext, rectangle, type);
    };

    board.deleteFragment = (data: DataTransfer | null) => {
        const selectedImageElement = getElementOfFocusedImage(board);
        if (selectedImageElement) {
            MindTransforms.removeImage(board, selectedImageElement as MindElement<ImageData>);
        }
        deleteFragment(data);
    };

    board.insertFragment = (data: DataTransfer | null, clipboardData: ClipboardData | null, targetPoint: Point) => {
        const selectedElements = getSelectedElements(board);
        const isSelectedImage = !!getElementOfFocusedImage(board);
        const isSingleSelection = selectedElements.length === 1 && MindElement.isMindElement(board, selectedElements[0]);
        if (isSelectedImage || isSingleSelection) {
            if (clipboardData?.files) {
                const acceptImageArray = acceptImageTypes.map(type => 'image/' + type);
                const selectedElement = (selectedElements[0] || getElementOfFocusedImage(board)) as MindElement;
                if (acceptImageArray.includes(clipboardData.files[0].type)) {
                    const imageFile = clipboardData.files[0];
                    buildImage(board, imageFile, DEFAULT_MIND_IMAGE_WIDTH, imageItem => {
                        MindTransforms.setImage(board, selectedElement, imageItem);
                    });
                }
            }
            if (clipboardData?.medias) {
                const selectedElement = (selectedElements[0] || getElementOfFocusedImage(board)) as MindElement;
                MindTransforms.setImage(board, selectedElement, clipboardData.medias[0]);
            }
        }
        insertFragment(data, clipboardData, targetPoint);
    };

    return board;
};
