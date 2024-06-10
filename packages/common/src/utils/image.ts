import { ComponentType, PlaitBoard, PlaitElement } from '@plait/core';
import { ImageBaseComponent } from '../image/image-base.component';

export interface CommonImageItem {
    url: string;
    width: number;
    height: number;
}

export const selectImage = (
    board: PlaitBoard,
    defaultImageWidth: number,
    handle: (commonImage: CommonImageItem) => void,
    acceptImageTypes: string[] = ['png', 'jpeg', 'gif', 'bmp']
) => {
    const inputFile = document.createElement('input');
    inputFile.setAttribute('type', 'file');
    const acceptImageTypesString = '.' + acceptImageTypes.join(',.');
    inputFile.setAttribute('accept', acceptImageTypesString);
    inputFile.onchange = (event: Event) => {
        buildImage(board, (event.target as any).files[0], defaultImageWidth, handle);
    };
    inputFile.click();
};

export const buildImage = async (
    board: PlaitBoard,
    imageFile: File,
    defaultImageWidth: number,
    handle: (commonImage: CommonImageItem) => void
) => {
    let width = 0,
        height = 0;
    await getImageSize(imageFile, defaultImageWidth).then((value: { width: number; height: number }) => {
        width = value.width;
        height = value.height;
    });

    let imageItem = null;
    const url = URL.createObjectURL(imageFile);
    const context = PlaitBoard.getBoardContext(board);
    context.setUploadingFile({ url, file: imageFile });

    imageItem = {
        url,
        width,
        height
    };
    handle(imageItem);
};

function getImageSize(file: File, defaultImageWidth: number): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = URL.createObjectURL(file);

        image.onload = function() {
            const width = defaultImageWidth;
            const height = (defaultImageWidth * image.naturalHeight) / image.naturalWidth;
            resolve(
                image.naturalWidth > defaultImageWidth ? { width, height } : { width: image.naturalWidth, height: image.naturalHeight }
            );
        };
    });
}

const BOARD_TO_ELEMENT_OF_FOCUSED_IMAGE = new WeakMap<PlaitBoard, PlaitElement>();

export const getElementOfFocusedImage = (board: PlaitBoard) => {
    return BOARD_TO_ELEMENT_OF_FOCUSED_IMAGE.get(board);
};

export const addElementOfFocusedImage = (board: PlaitBoard, element: PlaitElement) => {
    BOARD_TO_ELEMENT_OF_FOCUSED_IMAGE.set(board, element);
};

export const removeElementOfFocusedImage = (board: PlaitBoard) => {
    BOARD_TO_ELEMENT_OF_FOCUSED_IMAGE.delete(board);
};
