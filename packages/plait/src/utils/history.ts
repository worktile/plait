import { PlaitOperation } from '../interfaces';

/**
 * Check whether to merge an operation into the previous operation.
 */

export const shouldMerge = (op: PlaitOperation, prev: PlaitOperation | undefined): boolean => {
    if (
        op.type === 'set_viewport' ||
        (op.type === 'set_node' && prev?.type === 'set_node' && op?.newProperties?.width !== prev?.newProperties?.width)
    ) {
        return true;
    }
    return false;
};

/**
 * Check whether an operation needs to be saved to the history.
 */

export const shouldSave = (op: PlaitOperation, prev: PlaitOperation | undefined): boolean => {
    if (op.type === 'set_selection') {
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
