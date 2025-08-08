import { PlaitGeometry, BasicShapes } from './geometry';

export interface PlaitText extends PlaitGeometry {
    shape: BasicShapes.text;
    autoSize: boolean;
}

export enum TextColor {
    gray = '#828282',
    nomal = '#333333'
}
