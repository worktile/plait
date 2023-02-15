import { SimpleChanges, ViewContainerRef } from '@angular/core';
import { PlaitBoard, PlaitBoardOptions } from '../interfaces/board';
import { BaseCursorStatus } from '../interfaces/cursor';
import { PlaitElement } from '../interfaces/element';
import { PlaitPluginElementContext } from '../core/element/context';
import { PlaitOperation } from '../interfaces/operation';
import { Transforms } from '../transforms';
import { FLUSHING } from '../utils/weak-maps';

export function createBoard(host: SVGElement, children: PlaitElement[], options: PlaitBoardOptions): PlaitBoard {
    const board: PlaitBoard = {
        host,
        viewport: {
            zoom: 1,
            viewBackgroundColor: '#000',
            canvasPoint: []
        },
        children,
        operations: [],
        history: {
            redos: [],
            undos: []
        },
        selection: null,
        cursor: BaseCursorStatus.select,
        options: options || {
            readonly: false,
            allowClearBoard: false,
            hideScrollbar: false
        },
        undo: () => {},
        redo: () => {},
        apply: (operation: PlaitOperation) => {
            board.operations.push(operation);

            Transforms.transform(board, operation);

            if (!FLUSHING.get(board)) {
                FLUSHING.set(board, true);

                Promise.resolve().then(() => {
                    FLUSHING.set(board, false);
                    board.onChange();
                    board.operations = [];
                });
            }
        },
        onChange: () => {},
        mousedown: (event: MouseEvent) => {},
        globalMouseup: (event: MouseEvent) => {},
        mousemove: (event: MouseEvent) => {},
        keydown: (event: KeyboardEvent) => {},
        keyup: (event: KeyboardEvent) => {},
        dblclick: (event: MouseEvent) => {},
        setFragment: (data: DataTransfer | null) => {},
        insertFragment: (data: DataTransfer | null) => {},
        deleteFragment: (data: DataTransfer | null) => {},
        drawElement: (context: PlaitPluginElementContext, viewContainerRef: ViewContainerRef) => [],
        redrawElement: (context: PlaitPluginElementContext, viewContainerRef: ViewContainerRef, changes: SimpleChanges) => [],
        destroyElement: (context: PlaitPluginElementContext) => {}
    };
    return board;
}
