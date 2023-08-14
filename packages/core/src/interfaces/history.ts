import { PlaitBoard } from './board';
import { PlaitOperation } from './operation';

export interface PlaitHistory {
    redos: PlaitOperation[][];
    undos: PlaitOperation[][];
}

export const SAVING = new WeakMap<PlaitBoard, boolean | undefined>();
export const MERGING = new WeakMap<PlaitBoard, boolean | undefined>();
