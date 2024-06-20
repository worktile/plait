import { PlaitElement, PlaitOperation, PlaitTheme, Viewport, Selection, ComponentType, PlaitBoard } from '@plait/core';
import { RenderComponentRef } from '@plait/common';
import { ComponentRef } from '@angular/core';
import { BOARD_TO_COMPONENT } from '../utils/weak-maps';
import { BoardComponentInterface } from '../board/board.component.interface';

export interface AngularBoard {
    renderComponent: <T, K extends { nativeElement: () => HTMLElement }>(
        type: ComponentType<K>,
        container: Element | DocumentFragment,
        props: T
    ) => { ref: RenderComponentRef<T>; componentRef: ComponentRef<K> };
}

export const AngularBoard = {
    getBoardComponentInjector(board: PlaitBoard) {
        const boardComponent = BOARD_TO_COMPONENT.get(board) as BoardComponentInterface;
        return boardComponent.injector;
    }
}

export interface OnChangeData {
    children: PlaitElement[];
    operations: PlaitOperation[];
    viewport: Viewport;
    selection: Selection | null;
    theme: PlaitTheme;
}
