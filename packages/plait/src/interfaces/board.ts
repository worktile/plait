import { PlaitPointerType } from './pointer';
import { ComponentType, PlaitElement } from './element';
import { PlaitPluginElementContext } from '../core/element/context';
import { PlaitHistory } from './history';
import { PlaitOperation } from './operation';
import { Selection, Range } from './selection';
import { Viewport } from './viewport';
import { PlaitPluginElementComponent } from '../core/element/plugin-element';
import { BOARD_TO_COMPONENT, BOARD_TO_ELEMENT_HOST, BOARD_TO_HOST, BOARD_TO_ROUGH_SVG } from '../utils/weak-maps';
import { RoughSVG } from 'roughjs/bin/svg';
import { BoardComponentInterface } from '../board/board.component.interface';
import { Point } from './point';
import { RectangleClient } from './rectangle-client';
import { getRectangleByElements } from '../utils/element';

export interface PlaitBoard {
    viewport: Viewport;
    children: PlaitElement[];
    operations: PlaitOperation[];
    // record pointer selection or drag selection
    // it will be dirty when board viewport change
    selection: Selection | null;
    pointer: PlaitPointerType;
    history: PlaitHistory;
    options: PlaitBoardOptions;
    undo: () => void;
    redo: () => void;
    apply: (operation: PlaitOperation) => void;
    onChange: () => void;
    mousedown: (event: MouseEvent) => void;
    mousemove: (event: MouseEvent) => void;
    globalMousemove: (event: MouseEvent) => void;
    mouseup: (event: MouseEvent) => void;
    globalMouseup: (event: MouseEvent) => void;
    keydown: (event: KeyboardEvent) => void;
    keyup: (event: KeyboardEvent) => void;
    setFragment: (data: DataTransfer | null) => void;
    insertFragment: (data: DataTransfer | null, targetPoint?: Point) => void;
    deleteFragment: (data: DataTransfer | null) => void;
    dblclick: (event: MouseEvent) => void;
    drawElement: (context: PlaitPluginElementContext) => SVGGElement[] | ComponentType<PlaitPluginElementComponent>;
    redrawElement: (context: PlaitPluginElementContext, previousContext?: PlaitPluginElementContext) => SVGGElement[] | void;
    destroyElement: (context: PlaitPluginElementContext) => void;
    isIntersectionSelection: (element: PlaitElement, range: Range) => boolean;
    getRectangle: (element: PlaitElement) => RectangleClient | null;
    isWithinSelection: (element: PlaitElement) => boolean;
}

export interface PlaitBoardChangeEvent {
    children: PlaitElement[];
    operations: PlaitOperation[];
    viewport: Viewport;
    selection: Selection | null;
}

export interface PlaitBoardOptions {
    readonly: boolean;
    hideScrollbar: boolean;
}

export interface PlaitBoardMove {
    x: number;
    y: number;
}

export const PlaitBoard = {
    getHost(board: PlaitBoard) {
        return BOARD_TO_HOST.get(board) as SVGSVGElement;
    },
    getElementHost(board: PlaitBoard) {
        return BOARD_TO_ELEMENT_HOST.get(board) as SVGGElement;
    },
    getRoughSVG(board: PlaitBoard) {
        return BOARD_TO_ROUGH_SVG.get(board) as RoughSVG;
    },
    getComponent(board: PlaitBoard) {
        return BOARD_TO_COMPONENT.get(board) as BoardComponentInterface;
    },
    getBoardNativeElement(board: PlaitBoard) {
        return PlaitBoard.getComponent(board).nativeElement;
    },
    getRectangle(board: PlaitBoard) {
        return getRectangleByElements(board, board.children, true);
    },
    getViewportContainer(board: PlaitBoard) {
        return PlaitBoard.getHost(board).parentElement as HTMLElement;
    }
};
