import { PlaitBoard, PlaitElement, RectangleClient } from '@plait/core';
import { RenderComponentRef } from '../core/render-component';
import { CommonImageItem } from '../utils/image';

export interface PlaitImageBoard {
    renderImage: (container: Element | DocumentFragment, props: ImageProps) => ImageComponentRef;
}

export const withImage = <T extends PlaitBoard = PlaitBoard>(board: T) => {
    const newBoard = board as T & PlaitImageBoard;

    newBoard.renderImage = (container: Element | DocumentFragment, props: ImageProps) => {
        throw new Error('No implementation for renderImage method.');
    };
    return newBoard;
};

export type ImageComponentRef = RenderComponentRef<ImageProps>;

export interface ImageProps {
    board: PlaitBoard;
    imageItem: CommonImageItem;
    element: PlaitElement;
    isFocus?: boolean;
    getRectangle: () => RectangleClient;
}
