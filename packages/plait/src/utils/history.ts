import { PlaitOperation } from '../interfaces';

/**
 * Check whether to merge an operation into the previous operation.
 */

export const shouldMerge = (op: PlaitOperation, prev: PlaitOperation | undefined): boolean => {
    if (op.type === 'set_selection') {
        return true;
    }
    return false;
};

/**
 * Check whether an operation needs to be saved to the history.
 */

export const shouldSave = (op: PlaitOperation, prev: PlaitOperation | undefined): boolean => {
    if (op.type === 'set_selection' && (op.properties == null || op.newProperties == null)) {
        return false;
    }

    return true;
};

/**
 * Check whether an operation should overwrite the previous one.
 */

export const shouldOverwrite = (op: PlaitOperation, prev: PlaitOperation | undefined): boolean => {
    if (prev && op.type === 'set_selection' && prev.type === 'set_selection') {
        return true;
    }

    return false;
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
