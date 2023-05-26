import { PlaitBoard, PlaitBoardOptions } from '../interfaces/board';
import { PlaitPointerType } from '../interfaces/pointer';
import { PlaitElement } from '../interfaces/element';
import { PlaitPluginElementContext } from '../core/element/context';
import { PlaitOperation } from '../interfaces/operation';
import { Transforms } from '../transforms';
import { FLUSHING, PATH_REFS } from '../utils/weak-maps';
import { PathRef, PathRefOptions } from '../interfaces/path';
import { Path } from '@plait/core';

export function createBoard(children: PlaitElement[], options: PlaitBoardOptions): PlaitBoard {
    const board: PlaitBoard = {
        viewport: {
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
        pointer: PlaitPointerType.selection,
        options: options || {
            readonly: false,
            hideScrollbar: false
        },
        undo: () => {},
        redo: () => {},
        apply: (operation: PlaitOperation) => {
            for (const ref of board.pathRefs()) {
                PathRef.transform(ref, operation);
            }

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
        pathRef: (path: Path, options?: PathRefOptions) => {
            const affinity = options?.affinity || 'forward';
            const ref: PathRef = {
                current: path,
                affinity,
                unref() {
                    const { current } = ref;
                    const pathRefs = board.pathRefs();
                    pathRefs.delete(ref);
                    ref.current = null;
                    return current;
                }
            };

            const refs = board.pathRefs();
            refs.add(ref);
            return ref;
        },
        pathRefs: () => {
            let refs = PATH_REFS.get(board);

            if (!refs) {
                refs = new Set();
                PATH_REFS.set(board, refs);
            }

            return refs;
        },
        onChange: () => {},
        mousedown: (event: MouseEvent) => {},
        mousemove: (event: MouseEvent) => {},
        globalMousemove: (event: MouseEvent) => {},
        mouseup: (event: MouseEvent) => {},
        globalMouseup: (event: MouseEvent) => {},
        keydown: (event: KeyboardEvent) => {},
        keyup: (event: KeyboardEvent) => {},
        dblclick: (event: MouseEvent) => {},
        setFragment: (data: DataTransfer | null) => {},
        insertFragment: (data: DataTransfer | null) => {},
        deleteFragment: (data: DataTransfer | null) => {},
        drawElement: (context: PlaitPluginElementContext) => [],
        redrawElement: (context: PlaitPluginElementContext, previousContext) => {},
        destroyElement: (context: PlaitPluginElementContext) => {},
        isWithinSelection: element => false,
        isHitSelection: element => false,
        isRecursion: element => true,
        isMovable: element => false,
        getRectangle: element => null
    };
    return board;
}
