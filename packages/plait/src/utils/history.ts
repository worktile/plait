import { MERGING, PlaitBoard, PlaitOperation, SAVING } from '../interfaces';

/**
 * Check whether to merge an operation into the previous operation.
 */

export const shouldMerge = (op: PlaitOperation, prev: PlaitOperation | undefined): boolean => {
    if (op.type === 'set_viewport' && op.type === prev?.type) {
        return true;
    }
    return false;
};

/**
 * Check whether an operation needs to be saved to the history.
 */

export const shouldSave = (op: PlaitOperation, prev: PlaitOperation | undefined): boolean => {
    if (op.type === 'set_selection' || op.type === 'set_viewport') {
        return false;
    }

    return true;
};

/**
 * Check whether an operation should clear the redos stack.
 */

export const shouldClear = (op: PlaitOperation): boolean => {
    if (op.type === 'set_selection') {
        return false;
    }

    return true;
};

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

    withoutMerging(board: PlaitBoard, fn: () => void): void {
        const prev = PlaitHistoryBoard.isMerging(board);
        MERGING.set(board, false);
        fn();
        MERGING.set(board, prev);
    },
    /**
     * Apply a series of changes inside a synchronous `fn`, without saving any of
     * their operations into the history.
     */

    withoutSaving(board: PlaitBoard, fn: () => void): void {
        const prev = PlaitHistoryBoard.isSaving(board);
        SAVING.set(board, false);
        fn();
        SAVING.set(board, prev);
    }
};
