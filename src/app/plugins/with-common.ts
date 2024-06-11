import { PlaitBoard } from '@plait/core';
import { ImageProps, PlaitImageBoard } from '@plait/common';
import { AngularBoard } from '@plait/angular-board';
import { PlaitImageComponent } from '../editor/image/image.component';

export const withCommonPlugin = (board: PlaitBoard) => {
    const newBoard = board as PlaitBoard & PlaitImageBoard & AngularBoard;

    newBoard.renderImage = (container: Element | DocumentFragment, props: ImageProps) => {
        const { ref } = newBoard.renderComponent(PlaitImageComponent, container, props);
        return ref;
    };

    return board;
};
