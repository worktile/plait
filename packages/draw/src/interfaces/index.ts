import { GeometryShape, PlaitGeometry } from './geometry';
import { PlaitLine } from './line';
import { PlaitText } from './text';

export * from './line';
export * from './geometry';
export * from './text';
export * from './element';

export type PlaitDrawElement = PlaitGeometry | PlaitLine;

export const PlaitDrawElement = {
    isGeometry: (value: any): value is PlaitGeometry => {
        return value.type === 'geometry';
    },
    isLine: (value: any): value is PlaitLine => {
        return value.type === 'line';
    },
    isText: (value: any): value is PlaitText => {
        return value.type === 'geometry' && value.shape === GeometryShape.text;
    },
    isDrawElement: (value: any): value is PlaitDrawElement => {
        if (PlaitDrawElement.isGeometry(value) || PlaitDrawElement.isLine(value)) {
            return true;
        } else {
            return false;
        }
    }
};
