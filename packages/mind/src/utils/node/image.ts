import { PlaitBoard, PlaitElement, PlaitContextService } from '@plait/core';
import { MindNodeComponent } from '../../mind-node.component';
import { MindElement } from '../../interfaces/element';
import { ImageData, ImageItem } from '../../interfaces/element-data';
import { MindTransforms } from '../../transforms';
import { DEFAULT_IMAGE_WIDTH } from '../../constants/image';

const BOARD_TO_SELECTED_IMAGE_ELEMENT = new WeakMap<PlaitBoard, MindElement<ImageData>>();

export const getSelectedImageElement = (board: PlaitBoard) => {
    return BOARD_TO_SELECTED_IMAGE_ELEMENT.get(board);
};

export const addSelectedImageElement = (board: PlaitBoard, element: MindElement<ImageData>) => {
    BOARD_TO_SELECTED_IMAGE_ELEMENT.set(board, element);
};

export const removeSelectedImageElement = (board: PlaitBoard) => {
    BOARD_TO_SELECTED_IMAGE_ELEMENT.delete(board);
};

export const setImageFocus = (board: PlaitBoard, element: MindElement<ImageData>, isFocus: boolean) => {
    if (isFocus) {
        addSelectedImageElement(board, element);
    } else {
        removeSelectedImageElement(board);
    }

    const elementComponent = PlaitElement.getComponent(element) as MindNodeComponent;
    elementComponent.imageDrawer.componentRef!.instance.isFocus = isFocus;
    elementComponent.imageDrawer.componentRef!.instance.cdr.markForCheck();
};

export const selectImage = (board: PlaitBoard, element: MindElement, acceptImageTypes: string[] = ['png', 'jpeg', 'gif', 'bmp']) => {
    const inputFile = document.createElement('input');
    inputFile.setAttribute('type', 'file');
    const acceptImageTypesString = '.' + acceptImageTypes.join(',.');
    inputFile.setAttribute('accept', acceptImageTypesString);
    inputFile.onchange = (event: Event) => {
        buildImage(board, element, (event.target as any).files[0]);
    };
    inputFile.click();
};

export const buildImage = async (board: PlaitBoard, element: MindElement, imageFile: File) => {
    let width = 0,
        height = 0;
    await getImageSize(imageFile).then((value: { width: number; height: number }) => {
        width = value.width;
        height = value.height;
    });

    let imageItem: ImageItem | null = null;
    const url = URL.createObjectURL(imageFile);
    const context = PlaitBoard.getComponent(board).viewContainerRef.injector.get(PlaitContextService);
    context.setUploadingFile({ url, file: imageFile });

    imageItem = {
        url,
        width,
        height
    };

    MindTransforms.setImage(board, element, imageItem);
};

function getImageSize(file: File, defaultImageWidth: number = DEFAULT_IMAGE_WIDTH): Promise<{ width: number; height: number }> {
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
