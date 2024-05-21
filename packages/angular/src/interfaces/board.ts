import { PlaitBoard, PlaitElement, PlaitOperation, PlaitTheme, Viewport, Selection } from '@plait/core';
import { BOARD_TO_COMPONENT } from '../utils/weak-maps';
import { BoardComponentInterface } from '../board/board.component.interface';

export const AngularBoard = {
    getComponent(board: PlaitBoard) {
        return BOARD_TO_COMPONENT.get(board) as BoardComponentInterface;
    },
    getViewContainerRef(board: PlaitBoard) {
        return (BOARD_TO_COMPONENT.get(board) as BoardComponentInterface).viewContainerRef;
    }
};

export interface AngularBoardChangeEvent {
    children: PlaitElement[];
    operations: PlaitOperation[];
    viewport: Viewport;
    selection: Selection | null;
    theme: PlaitTheme;
}
