import { GeometryShape, LineShape } from '../interfaces';

export type DrawPointerType = GeometryShape | LineShape;

export const getGeometryPointers = () => {
    return Object.keys(GeometryShape);
};
