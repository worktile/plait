import { ParagraphElement } from '@plait/text';
import { EngineExtraData } from './engine';

export enum StrokeStyle {
    solid = 'solid',
    dashed = 'dashed',
    dotted = 'dotted'
}

export enum MemorizeKey {
    basicShape = 'basicShape',
    flowchart = 'flowchart',
    text = 'text',
    line = 'line'
}

export interface PlaitDrawShapeText extends EngineExtraData{
    key: string;
    text: ParagraphElement;
    textHeight: number;
}
