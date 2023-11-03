import { PlaitGeometry, BasicShapes } from './geometry';

export interface PlaitText extends PlaitGeometry {
    shape: BasicShapes.text;
    autoSize: boolean;
}
