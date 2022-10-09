import { SimpleChanges } from '@angular/core';
import { CursorStatus } from './cursor';
import { PlaitElement } from './element';
import { PlaitElementContext } from './element-context';
import { PlaitHistory } from './history';
import { PlaitOperation } from './operation';
import { Selection } from './selection';
import { Viewport } from './viewport';

export interface PlaitBoard {
    host: SVGElement;
    viewport: Viewport;
    children: PlaitElement[];
    operations: PlaitOperation[];
    selection: Selection | null;
    cursor: CursorStatus;
    readonly: boolean;
    fullscreen: boolean;
    allowClearBoard: boolean;
    history: PlaitHistory;
    undo: () => void;
    redo: () => void;
    apply: (operation: PlaitOperation) => void;
    onChange: () => void;
    mousedown: (event: MouseEvent) => void;
    globalMouseup: (event: MouseEvent) => void;
    mousemove: (event: MouseEvent) => void;
    keydown: (event: KeyboardEvent) => void;
    keyup: (event: KeyboardEvent) => void;
    setFragment: (data: DataTransfer | null) => void;
    insertFragment: (data: DataTransfer | null) => void;
    deleteFragment: (data: DataTransfer | null) => void;
    dblclick: (event: MouseEvent) => void;
    drawElement: (context: PlaitElementContext) => SVGGElement[];
    redrawElement: (context: PlaitElementContext, changes: SimpleChanges) => SVGGElement[];
    destroyElement: () => void;
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
    fullscreen: boolean;
}

export interface PlaitBoardMove {
    x: number;
    y: number;
}
