import { GeometryShape, PlaitBaseGeometry } from './geometry';
import { PlaitBaseLine } from './line';
import { PlaitText } from './text';

export * from './line';
export * from './geometry';
export * from './text';

export const PlaitDrawElement = {
    isGeometry: (value: any): value is PlaitBaseGeometry => {
        return value.type === 'geometry';
    },
    isLine: (value: any): value is PlaitBaseLine => {
        return value.type === 'line';
    },
    isText: (value: any): value is PlaitText => {
        return value.type === 'geometry' && value.shape === GeometryShape.text;
    }
};
