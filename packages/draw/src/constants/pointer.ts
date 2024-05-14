import { BasicShapes, FlowchartSymbols, LineShape, SwimlaneSymbols, TableSymbols, UMLSymbols } from '../interfaces';

export type DrawPointerType = BasicShapes | LineShape | FlowchartSymbols | SwimlaneSymbols | TableSymbols | UMLSymbols;

export const getGeometryPointers = () => {
    return [...Object.keys(BasicShapes), ...Object.keys(FlowchartSymbols), ...Object.keys(UMLSymbols)];
};

export const getBasicPointers = () => {
    return Object.keys(BasicShapes);
};

export const getFlowchartPointers = () => {
    return Object.keys(FlowchartSymbols);
};

export const getUMLPointers = () => {
    return Object.keys(UMLSymbols);
};

export const getLinePointers = () => {
    return Object.keys(LineShape);
};
