import { PlaitBoard, Point, PlaitNode, Transforms } from '@plait/core';
import { MindElement } from '../interfaces';
import { ImageData } from '../interfaces/element-data';
import { addSelectedImageElement, getSelectedImageElement } from '../utils/node/image';
import { getHitImageResizeHandleDirection } from '../utils';
import { ResizeCursorDirection, ResizeDirection, ResizeRef, ResizeState, WithResizeOptions, withResize } from '@plait/common';
import { MindTransforms } from '../transforms';

export const withNodeImageResize = (board: PlaitBoard) => {
    const options: WithResizeOptions<MindElement<ImageData>> = {
        key: 'mind-node-image',
        canResize: () => {
            return true;
        },
        detect: (point: Point) => {
            const selectedMindElement = getSelectedImageElement(board);
            if (selectedMindElement) {
                const result = getHitImageResizeHandleDirection(board, selectedMindElement, point);
                if (result) {
                    return {
                        element: selectedMindElement,
                        direction: result.direction as ResizeDirection,
                        cursorDirection: result.cursorDirection as ResizeCursorDirection
                    };
                }
            }
            return null;
        },
        onResize: (resizeRef: ResizeRef<MindElement<ImageData>>, resizeState: ResizeState) => {
            let offsetX = resizeState.offsetX;
            let offsetY = resizeState.offsetY;
            if (resizeRef.direction === ResizeDirection.nw || resizeRef.direction === ResizeDirection.sw) {
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
            addSelectedImageElement(board, PlaitNode.get(board, resizeRef.path));
        }
    };

    withResize<MindElement<ImageData>>(board, options);

    return board;
};
