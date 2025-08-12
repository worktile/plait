import {
    BasicShapes,
    FlowchartSymbols,
    ArrowLineShape,
    SwimlaneDrawSymbols,
    TableSymbols,
    UMLSymbols,
    VectorLinePointerType,
    SwimlaneSymbols
} from '../interfaces';

export type DrawPointerType =
    | BasicShapes
    | ArrowLineShape
    | FlowchartSymbols
    | SwimlaneDrawSymbols
    | TableSymbols
    | UMLSymbols
    | VectorLinePointerType;

export const getGeometryPointers = () => {
    return [...Object.keys(BasicShapes), ...Object.keys(FlowchartSymbols), ...Object.keys(UMLSymbols)];
};

export const getSwimlanePointers = () => {
    return Object.keys(SwimlaneDrawSymbols);
};

export const getSwimlaneShapes = () => {
    return Object.keys(SwimlaneSymbols);
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

export const getVectorLinePointers = () => {
    return Object.keys(VectorLinePointerType);
};
