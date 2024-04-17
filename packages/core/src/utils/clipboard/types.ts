import { PlaitElement } from '../../interfaces';

export enum WritableClipboardType {
    'medias' = 'medias',
    'elements' = 'elements'
}

export type WritableClipboardData = PlaitElement[] | any[];

export interface WritableClipboardContext {
    text: string;
    type: WritableClipboardType;
    elements: WritableClipboardData;
}

export interface ClipboardData {
    files?: File[];
    elements?: PlaitElement[];
    medias?: any[];
    text?: string;
}
