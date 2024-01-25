import { PlaitBoard, Point, PlaitNode, Path } from '@plait/core';
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
            const offsetX = Point.getOffsetX(resizeState.startPoint, resizeState.endPoint);
            const originWidth = resizeRef.element.data.image.width;
            const originHeight = resizeRef.element.data.image.height;
            const path = resizeRef.path as Path;
            let width = originWidth + offsetX;
            if (width <= 100) {
                width = 100;
            }
            const ratio = originWidth / originHeight;
            const height = width / ratio;
            const imageItem = { ...resizeRef.element.data.image, width, height };
            MindTransforms.setImage(board, PlaitNode.get(board, path), imageItem);
            addElementOfFocusedImage(board, PlaitNode.get(board, path));
        }
    };

    withResize<MindElement<ImageData>>(board, options);

    return board;
};
