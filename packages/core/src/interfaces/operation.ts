import { PlaitNode } from './node';
import { Path } from './path';
import { Selection } from './selection';
import { PlaitTheme } from './theme';
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

export type SetThemeOperation = {
    type: 'set_theme';
    properties: Partial<PlaitTheme>;
    newProperties: Partial<PlaitTheme>;
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
    | MoveNodeOperation
    | SetThemeOperation;

export interface PlaitOperationInterface {
    inverse: (op: PlaitOperation) => PlaitOperation;
    isSetViewportOperation: (value: any) => boolean;
    isSetSelectionOperation: (value: any) => boolean;
    isSetThemeOperation: (value: any) => boolean;
}

export const isSetViewportOperation = (value: any): value is SetViewportOperation => {
    return value.type === 'set_viewport';
};

export const isSetSelectionOperation = (value: any): value is SetSelectionOperation => {
    return value.type === 'set_selection';
};

export const isSetThemeOperation = (value: any): value is SetThemeOperation => {
    return value.type === 'set_theme';
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

            // when operation path is [0,0] -> [0,2], should exec Path.transform to get [0,1] -> [0,0]
            // shoud not return [0,2] -> [0,0] #WIK-8981
            // if (Path.isSibling(path, newPath)) {
            //     return { ...op, path: newPath, newPath: path };
            // }

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

        case 'set_theme': {
            const { properties, newProperties } = op;
            return { ...op, properties: newProperties, newProperties: properties };
        }
    }
};

export const PlaitOperation: PlaitOperationInterface = {
    isSetViewportOperation,
    isSetSelectionOperation,
    isSetThemeOperation,
    inverse
};
