import { PlaitBoard, PlaitOperation } from '../interfaces';
import { isHotkey } from 'is-hotkey';
import { shouldClear, shouldMerge, shouldSave } from '../utils';

export function withHistroy<T extends PlaitBoard>(board: T) {
    const { apply, keydown } = board;
    board.history = { undos: [], redos: [] };

    board.redo = () => {
        const { history } = board;
        const { redos } = history;

        if (redos.length > 0) {
            const batch = redos[redos.length - 1];

            PlaitHistoryBoard.withoutSaving(board, () => {
                for (const op of batch) {
                    board.apply(op);
                }
            });

            history.redos.pop();
            history.undos.push(batch);
        }
    };

    board.undo = () => {
        const { history } = board;
        const { undos } = history;

        if (undos.length > 0) {
            const batch = undos[undos.length - 1];

            PlaitHistoryBoard.withoutSaving(board, () => {
                const inverseOps = batch.map(PlaitOperation.inverse).reverse();
                for (const op of inverseOps) {
                    board.apply(op);
                }
            });

            history.redos.push(batch);
            history.undos.pop();
        }
    };

    board.apply = (op: PlaitOperation) => {
        const { operations, history } = board;
        const { undos } = history;
        const lastBatch = undos[undos.length - 1];
        const lastOp = lastBatch && lastBatch[lastBatch.length - 1];
        let save = PlaitHistoryBoard.isSaving(board);
        let merge = PlaitHistoryBoard.isMerging(board);

        if (save == null) {
            save = shouldSave(op, lastOp);
        }

        if (save) {
            if (merge == null) {
                if (lastBatch == null) {
                    merge = false;
                } else if (operations.length !== 0) {
                    merge = true;
                } else {
                    merge = shouldMerge(op, lastOp);
                }
            }

            if (lastBatch && merge) {
                lastBatch.push(op);
            } else {
                const batch = [op];
                undos.push(batch);
            }

            while (undos.length > 100) {
                undos.shift();
            }

            if (shouldClear(op)) {
                history.redos = [];
            }
        }
        apply(op);
    };

    board.keydown = (event: KeyboardEvent) => {
        if (isHotkey('mod+z', event)) {
            board.undo();
            return;
        }
        if (isHotkey('mod+shift+z', event)) {
            board.redo();
            return;
        }
        keydown(event);
    };

    return board;
}

export const SAVING = new WeakMap<PlaitBoard, boolean | undefined>();
export const MERGING = new WeakMap<PlaitBoard, boolean | undefined>();

export const PlaitHistoryBoard = {
    /**
     * Get the saving flag's current value.
     */
    isSaving(board: PlaitBoard): boolean | undefined {
        return SAVING.get(board);
    },

    /**
     * Get the merge flag's current value.
     */

    isMerging(board: PlaitBoard): boolean | undefined {
        return MERGING.get(board);
    },

    /**
     * Apply a series of changes inside a synchronous `fn`, without merging any of
     * the new operations into previous save point in the history.
     */

    withoutMerging(editor: PlaitBoard, fn: () => void): void {
        const prev = PlaitHistoryBoard.isMerging(editor);
        MERGING.set(editor, false);
        fn();
        MERGING.set(editor, prev);
    },
    /**
     * Apply a series of changes inside a synchronous `fn`, without saving any of
     * their operations into the history.
     */

    withoutSaving(editor: PlaitBoard, fn: () => void): void {
        const prev = PlaitHistoryBoard.isSaving(editor);
        SAVING.set(editor, false);
        fn();
        SAVING.set(editor, prev);
    }
};
