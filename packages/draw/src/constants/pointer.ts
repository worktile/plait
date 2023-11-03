import { BasicShapes, FlowchartSymbols, LineShape } from '../interfaces';

export type DrawPointerType = BasicShapes | LineShape | FlowchartSymbols;

export const getGeometryPointers = () => {
    return Object.keys(BasicShapes);
};

export const getLinePointers = () => {
    return Object.keys(LineShape);
};
