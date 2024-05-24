import { BasicShapes, FlowchartSymbols, GeometryShapes, PlaitGeometry, SwimlaneSymbols, TableSymbols, UMLSymbols } from './geometry';
import { PlaitImage } from './image';
import { PlaitLine } from './line';
import { PlaitTable, PlaitTableElement } from './table';
import { PlaitText } from './text';

export * from './line';
export * from './geometry';
export * from './text';
export * from './element';
export * from './engine';

export type PlaitDrawElement = PlaitGeometry | PlaitLine | PlaitImage | PlaitTable;

export type PlaitShapeElement = PlaitGeometry | PlaitImage | PlaitTable;

export type DrawShapes = GeometryShapes | TableSymbols;

export const PlaitDrawElement = {
    isGeometry: (value: any): value is PlaitGeometry => {
        return value.type === 'geometry';
    },
    isLine: (value: any): value is PlaitLine => {
        return value.type === 'line';
    },
    isText: (value: any): value is PlaitText => {
        return value.type === 'geometry' && value.shape === BasicShapes.text;
    },
    isImage: (value: any): value is PlaitImage => {
        return value.type === 'image';
    },
    isTable: (value: any): value is PlaitTable => {
        return PlaitTableElement.isTable(value);
    },
    isDrawElement: (value: any): value is PlaitDrawElement => {
        if (
            PlaitDrawElement.isGeometry(value) ||
            PlaitDrawElement.isLine(value) ||
            PlaitDrawElement.isImage(value) ||
            PlaitTableElement.isTable(value)
        ) {
            return true;
        } else {
            return false;
        }
    },
    isShapeElement: (value: any): value is PlaitShapeElement => {
        return PlaitDrawElement.isImage(value) || PlaitDrawElement.isGeometry(value) || PlaitDrawElement.isTable(value);
    },
    isBasicShape: (value: any) => {
        return Object.keys(BasicShapes).includes(value.shape);
    },
    isFlowchart: (value: any) => {
        return Object.keys(FlowchartSymbols).includes(value.shape);
    },
    isUML: (value: any) => {
        return Object.keys(UMLSymbols).includes(value.shape);
    },
    isSwimlane: (value: any) => {
        return Object.keys(SwimlaneSymbols).includes(value.shape);
    },
    isVerticalSwimlane: (value: any) => {
        return Object.keys(SwimlaneSymbols).includes(value.shape) && value.shape === SwimlaneSymbols.swimlaneVertical;
    },
    isHorizontalSwimlane: (value: any) => {
        return Object.keys(SwimlaneSymbols).includes(value.shape) && value.shape === SwimlaneSymbols.swimlaneHorizontal;
    },
    isUMLClassOrInterface: (value: any) => {
        return false;
    }
};
