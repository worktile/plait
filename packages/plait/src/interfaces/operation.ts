import { PlaitNode } from './node';
import { Path } from './path';
import { Selection } from './selection';
import { Viewport } from './viewport';

export type InsertNodeOperation = {
    type: 'insert_node';
    path: Path;
    node: PlaitNode;
};

export type RemoveNodeOperation = {
    type: 'remove_node';
    path: Path;
    node: PlaitNode;
};

export type MoveNodeOperation = {
    type: 'move_node';
    path: Path;
    newPath: Path;
};

export type SetViewportOperation = {
    type: 'set_viewport';
    properties: Partial<Viewport>;
    newProperties: Partial<Viewport>;
};

export type SetSelectionOperation = {
    type: 'set_selection';
    properties: Selection | null;
    newProperties: Selection | null;
};

export type SetNodeOperation = {
    type: 'set_node';
    path: Path;
    properties: Partial<PlaitNode>;
    newProperties: Partial<PlaitNode>;
};

export type PlaitOperation =
    | InsertNodeOperation
    | SetViewportOperation
    | SetSelectionOperation
    | SetNodeOperation
    | RemoveNodeOperation
    | MoveNodeOperation;

export interface PlaitOperationInterface {
    inverse: (op: PlaitOperation) => PlaitOperation;
    isSetViewportOperation: (value: any) => boolean;
}

export const isSetViewportOperation = (value: any): value is SetViewportOperation => {
    return value.type === 'set_viewport';
};

export const inverse = (op: PlaitOperation): PlaitOperation => {
    switch (op.type) {
        case 'insert_node': {
            return { ...op, type: 'remove_node' };
        }

        case 'remove_node': {
            return { ...op, type: 'insert_node' };
        }

        case 'move_node': {
            const { newPath, path } = op;

            // PERF: in this case the move operation is a no-op anyways.
            if (Path.equals(newPath, path)) {
                return op;
            }

            // If the move happens completely within a single parent the path and
            // newPath are stable with respect to each other.
            if (Path.isSibling(path, newPath)) {
                return { ...op, path: newPath, newPath: path };
            }

            // If the move does not happen within a single parent it is possible
            // for the move to impact the true path to the location where the node
            // was removed from and where it was inserted. We have to adjust for this
            // and find the original path. We can accomplish this (only in non-sibling)
            // moves by looking at the impact of the move operation on the node
            // after the original move path.
            const inversePath = Path.transform(path, op)!;
            const inverseNewPath = Path.transform(Path.next(path), op)!;
            return { ...op, path: inversePath, newPath: inverseNewPath };
        }

        case 'set_node': {
            const { properties, newProperties } = op;
            return { ...op, properties: newProperties, newProperties: properties };
        }

        case 'set_selection': {
            const { properties, newProperties } = op;

            if (properties == null) {
                return {
                    ...op,
                    properties: newProperties,
                    newProperties: null
                };
            } else if (newProperties == null) {
                return {
                    ...op,
                    properties: null,
                    newProperties: properties
                };
            } else {
                return { ...op, properties: newProperties, newProperties: properties };
            }
        }

        case 'set_viewport': {
            const { properties, newProperties } = op;
            if (properties == null) {
                return {
                    ...op,
                    properties: newProperties,
                    newProperties: newProperties
                };
            } else if (newProperties == null) {
                return {
                    ...op,
                    properties: properties,
                    newProperties: properties
                };
            } else {
                return { ...op, properties: newProperties, newProperties: properties };
            }
        }
    }
};

export const PlaitOperation: PlaitOperationInterface = {
    isSetViewportOperation,
    inverse
};
