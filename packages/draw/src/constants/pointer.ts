import { BasicShapes, FlowchartSymbols, LineShape } from '../interfaces';

export type DrawPointerType = BasicShapes | LineShape | FlowchartSymbols;

export const getGeometryPointers = () => {
    return [...Object.keys(BasicShapes), ...Object.keys(FlowchartSymbols)];
};

export const getBasicPointers = () => {
    return Object.keys(BasicShapes);
};

export const getFlowchartPointers = () => {
    return Object.keys(FlowchartSymbols);
};

export const getLinePointers = () => {
    return Object.keys(LineShape);
};
