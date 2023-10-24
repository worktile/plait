import { GeometryShape, LineShape } from '../interfaces';

export type DrawPointerType = GeometryShape | LineShape;

export const getGeometryPointer = () => {
    return [...Object.keys(GeometryShape), Object.keys(LineShape)];
};
