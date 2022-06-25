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

export type PlaitOperation = InsertNodeOperation | SetViewportOperation | SetSelectionOperation | SetNodeOperation | RemoveNodeOperation;

const isSetViewportOperation = (value: any): value is SetViewportOperation => {
    return value.type === 'set_viewport';
};
