// Credits to slate - https://github.com/ianstormtaylor/slate

import { MERGING, PlaitBoard, PlaitOperation, SAVING, SPLITTING_ONCE } from '../interfaces';

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
     * Get the splitting once flag's current value.
     */

    isSplittingOnce(board: PlaitBoard): boolean | undefined {
        return SPLITTING_ONCE.get(board);
    },

    setSplittingOnce(board: PlaitBoard, value: boolean | undefined): void {
        SPLITTING_ONCE.set(board, value);
    },

    /**
     * Apply a series of changes inside a synchronous `fn`, These operations will
     * be merged into the previous history.
     */
    withMerging(board: PlaitBoard, fn: () => void): void {
        const prev = PlaitHistoryBoard.isMerging(board);
        MERGING.set(board, true);
        fn();
        MERGING.set(board, prev);
    },

    /**
     * Apply a series of changes inside a synchronous `fn`, ensuring that the first
     * operation starts a new batch in the history. Subsequent operations will be
     * merged as usual.
     */
    withNewBatch(board: PlaitBoard, fn: () => void): void {
        const prev = PlaitHistoryBoard.isMerging(board);
        MERGING.set(board, true);
        SPLITTING_ONCE.set(board, true);
        fn();
        MERGING.set(board, prev);
        SPLITTING_ONCE.delete(board);
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
