import { PlaitElement } from '../interfaces/element';
import { PlaitOperation } from '../interfaces/operation';
import { PlaitBoard, PlaitBoardOptions } from '../interfaces/board';
import { PlaitElementContext } from '../interfaces/element-context';
import { SimpleChanges } from '@angular/core';
import { FLUSHING } from '../utils/weak-maps';
import { Transforms } from '../transfroms';
import { BaseCursorStatus } from '../interfaces/cursor';

export function createBoard(host: SVGElement, children: PlaitElement[], options: PlaitBoardOptions): PlaitBoard {
    const board: PlaitBoard = {
        host,
        viewport: {
            offsetX: 0,
            offsetY: 0,
            zoom: 1,
            viewBackgroundColor: '#000'
        },
        children,
        operations: [],
        history: {
            redos: [],
            undos: []
        },
        selection: null,
        cursor: BaseCursorStatus.select,
        readonly: options.readonly,
        allowClearBoard: options.allowClearBoard,
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
        drawElement: (context: PlaitElementContext) => [],
        redrawElement: (context: PlaitElementContext, changes: SimpleChanges) => [],
        destroyElement: () => {}
    };
    return board;
}
