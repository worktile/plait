import { PlaitBoard, Point, PlaitNode } from '@plait/core';
import { MindElement } from '../interfaces';
import { ImageData } from '../interfaces/element-data';
import { getHitImageResizeHandleDirection } from '../utils';
import {
    ResizeHandle,
    ResizeRef,
    ResizeState,
    WithResizeOptions,
    addElementOfFocusedImage,
    getElementOfFocusedImage,
    withResize
} from '@plait/common';
import { MindTransforms } from '../transforms';

export const withNodeImageResize = (board: PlaitBoard) => {
    const options: WithResizeOptions<MindElement<ImageData>> = {
        key: 'mind-node-image',
        canResize: () => {
            return true;
        },
        detect: (point: Point) => {
            const elementOfFocusedImage = getElementOfFocusedImage(board);
            const selectedMindElement =
                elementOfFocusedImage && MindElement.isMindElement(board, elementOfFocusedImage) ? elementOfFocusedImage : undefined;
            if (selectedMindElement) {
                const result = getHitImageResizeHandleDirection(board, selectedMindElement as MindElement<ImageData>, point);
                if (result) {
                    return {
                        element: selectedMindElement as MindElement<ImageData>,
                        handle: result.handle as ResizeHandle,
                        cursorClass: result.cursorClass
                    };
                }
            }
            return null;
        },
        onResize: (resizeRef: ResizeRef<MindElement<ImageData>>, resizeState: ResizeState) => {
            let offsetX = resizeState.offsetX;
            let offsetY = resizeState.offsetY;
            if (resizeRef.handle === ResizeHandle.nw || resizeRef.handle === ResizeHandle.sw) {
                offsetX = -offsetX;
            }
            const originWidth = resizeRef.element.data.image.width;
            const originHeight = resizeRef.element.data.image.height;
            let width = originWidth + offsetX;
            if (width <= 100) {
                width = 100;
            }
            const ratio = originWidth / width;
            const height = originHeight / ratio;
            const imageItem = { ...resizeRef.element.data.image, width, height };
            MindTransforms.setImage(board, PlaitNode.get(board, resizeRef.path), imageItem);
            addElementOfFocusedImage(board, PlaitNode.get(board, resizeRef.path));
        }
    };

    withResize<MindElement<ImageData>>(board, options);

    return board;
};
