import { ImageItem, MindElement, PlaitMindBoard } from '@plait/mind';
import { PlaitBoard } from '@plait/core';
import { MindImageComponent } from './image.component';

export const withImageExtend = (board: PlaitBoard) => {
    const newBoard = board as PlaitBoard & PlaitMindBoard;

    newBoard.drawImage = (image: ImageItem, element: MindElement) => {
        return MindImageComponent;
    };

    return newBoard;
};
