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
    ClipboardData,
    isContextmenu,
    PlaitElement,
    WritableClipboardOperationType
} from '@plait/core';
import { MindElement } from '../interfaces';
import { ImageData } from '../interfaces/element-data';
import { addImageFocus, removeImageFocus } from '../utils/node/image';
import { isHitImage } from '../utils';
import { MindTransforms } from '../transforms';
import { acceptImageTypes, buildImage, getElementOfFocusedImage } from '@plait/common';
import { DEFAULT_MIND_IMAGE_WIDTH } from '../constants';

export const withNodeImage = (board: PlaitBoard) => {
    const { keyDown, pointerUp, globalPointerUp, buildFragment, insertFragment, deleteFragment } = board;

    board.pointerUp = (event: PointerEvent) => {
        const elementOfFocusedImage = getElementOfFocusedImage(board);
        if (
            elementOfFocusedImage &&
            MindElement.isMindElement(board, elementOfFocusedImage) &&
            !isContextmenu(event) &&
            (PlaitBoard.isReadonly(board) || !isMainPointer(event) || !PlaitBoard.isPointer(board, PlaitPointerType.selection))
        ) {
            removeImageFocus(board, elementOfFocusedImage as MindElement<ImageData>);
            pointerUp(event);
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
            pointerUp(event);
            return;
        }
        if (elementOfFocusedImage && MindElement.isMindElement(board, elementOfFocusedImage)) {
            removeImageFocus(board, elementOfFocusedImage as MindElement<ImageData>);
        }
        if (isHitImageResult && hitElement) {
            temporaryDisableSelection(board as PlaitOptionsBoard);
            addImageFocus(board, hitElement as MindElement<ImageData>);
        }
        pointerUp(event);
    };

    board.keyDown = (event: KeyboardEvent) => {
        const selectedImageElement = getElementOfFocusedImage(board);
        if (!PlaitBoard.isReadonly(board) && selectedImageElement && (hotkeys.isDeleteBackward(event) || hotkeys.isDeleteForward(event))) {
            addSelectedElement(board, selectedImageElement);
            MindTransforms.removeImage(board, selectedImageElement as MindElement<ImageData>);
            return;
        }
        keyDown(event);
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

    board.buildFragment = (
        clipboardContext: WritableClipboardContext | null,
        rectangle: RectangleClient | null,
        operationType: WritableClipboardOperationType,
        originData?: PlaitElement[]
    ) => {
        const selectedImageElement = getElementOfFocusedImage(board) as MindElement<ImageData>;
        if (selectedImageElement) {
            clipboardContext = createClipboardContext(WritableClipboardType.medias, [selectedImageElement.data.image], '', operationType);
        }
        return buildFragment(clipboardContext, rectangle, operationType, originData);
    };

    board.deleteFragment = (elements: PlaitElement[]) => {
        const selectedImageElement = getElementOfFocusedImage(board);
        if (selectedImageElement) {
            MindTransforms.removeImage(board, selectedImageElement as MindElement<ImageData>);
        }
        deleteFragment(elements);
    };

    board.insertFragment = (clipboardData: ClipboardData | null, targetPoint: Point) => {
        const selectedElements = getSelectedElements(board);
        const isSelectedImage = !!getElementOfFocusedImage(board);
        const isSingleSelection = selectedElements.length === 1 && MindElement.isMindElement(board, selectedElements[0]);
        if (isSelectedImage || isSingleSelection) {
            if (clipboardData?.files?.length) {
                const acceptImageArray = acceptImageTypes.map(type => 'image/' + type);
                const selectedElement = (selectedElements[0] || getElementOfFocusedImage(board)) as MindElement;
                if (acceptImageArray.includes(clipboardData.files[0].type)) {
                    const imageFile = clipboardData.files[0];
                    buildImage(board, imageFile, DEFAULT_MIND_IMAGE_WIDTH, imageItem => {
                        MindTransforms.setImage(board, selectedElement, imageItem);
                    });
                    return;
                }
            }
            if (clipboardData?.medias?.length) {
                const selectedElement = (selectedElements[0] || getElementOfFocusedImage(board)) as MindElement;
                MindTransforms.setImage(board, selectedElement, clipboardData.medias[0]);
                return;
            }
        }
        insertFragment(clipboardData, targetPoint);
    };

    return board;
};
