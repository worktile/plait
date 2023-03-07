import { PlaitPointerType } from './pointer';
import { ComponentType, PlaitElement } from './element';
import { PlaitPluginElementContext } from '../core/element/context';
import { PlaitHistory } from './history';
import { PlaitOperation } from './operation';
import { Selection } from './selection';
import { Viewport } from './viewport';
import { PlaitPluginElementComponent } from '../core/element/plugin-element';

export interface PlaitBoard {
    host: SVGElement;
    viewport: Viewport;
    children: PlaitElement[];
    operations: PlaitOperation[];
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
    mouseup: (event: MouseEvent) => void;
    globalMouseup: (event: MouseEvent) => void;
    keydown: (event: KeyboardEvent) => void;
    keyup: (event: KeyboardEvent) => void;
    setFragment: (data: DataTransfer | null) => void;
    insertFragment: (data: DataTransfer | null) => void;
    deleteFragment: (data: DataTransfer | null) => void;
    dblclick: (event: MouseEvent) => void;
    drawElement: (context: PlaitPluginElementContext) => SVGGElement[] | ComponentType<PlaitPluginElementComponent>;
    redrawElement: (context: PlaitPluginElementContext, previousContext?: PlaitPluginElementContext) => SVGGElement[] | void;
    destroyElement: (context: PlaitPluginElementContext) => void;
    isIntersectionSelection: (element: PlaitElement) => boolean;
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
    allowClearBoard: boolean;
    hideScrollbar: boolean;
}

export interface PlaitBoardMove {
    x: number;
    y: number;
}

export interface PlaitBoardViewport {
    zoom: number;
    autoFitPadding: number;
    scrollBarWidth: number;
    focusPoint?: number[];
    viewBox?: number[];
    viewportWidth?: number;
    viewportHeight?: number;
    scrollLeft?: number;
    scrollTop?: number;
}
