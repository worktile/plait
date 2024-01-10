import { PlaitBoard, PlaitOperation } from '../interfaces';
import { isHotkey } from 'is-hotkey';
import { PlaitHistoryBoard, shouldClear, shouldMerge, shouldSave } from '../utils';

export function withHistory<T extends PlaitBoard>(board: T) {
    const { apply, keyDown } = board;
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
            if (!merge) {
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

    board.keyDown = (event: KeyboardEvent) => {
        if (isHotkey('mod+z', event)) {
            board.undo();
            return;
        }
        if (isHotkey('mod+shift+z', event)) {
            board.redo();
            return;
        }
        keyDown(event);
    };

    return board;
}
