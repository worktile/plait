import { PlaitOperation } from './operation';

export interface PlaitHistory {
    redos: PlaitOperation[][];
    undos: PlaitOperation[][];
}
