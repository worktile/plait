import { BasicShapes, FlowchartSymbols, ArrowLineShape, SwimlaneDrawSymbols, TableSymbols, UMLSymbols } from '../interfaces';

export type DrawPointerType = BasicShapes | ArrowLineShape | FlowchartSymbols | SwimlaneDrawSymbols | TableSymbols | UMLSymbols;

export const getGeometryPointers = () => {
    return [...Object.keys(BasicShapes), ...Object.keys(FlowchartSymbols), ...Object.keys(UMLSymbols)];
};

export const getSwimlanePointers = () => {
    return Object.keys(SwimlaneDrawSymbols);
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

export const getArrowLinePointers = () => {
    return Object.keys(ArrowLineShape);
};
