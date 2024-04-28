import { PlaitElement } from '../../interfaces';

export enum WritableClipboardType {
    'medias' = 'medias',
    'elements' = 'elements'
}

export enum WritableClipboardOperationType {
    'copy' = 'copy',
    'cut' = 'cut',
    'duplicate' = 'duplicate',
    'paste' = 'paste'
}

export type WritableClipboardData = PlaitElement[] | any[];

export interface WritableClipboardContext {
    text: string;
    type: WritableClipboardType;
    elements: WritableClipboardData;
    operationType?: WritableClipboardOperationType;
}

export interface ClipboardData {
    files?: File[];
    elements?: PlaitElement[];
    medias?: any[];
    text?: string;
    operationType?: WritableClipboardOperationType;
}
