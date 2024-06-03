import { BasicShapes, FlowchartSymbols, GeometryShapes, PlaitBaseGeometry, PlaitGeometry, UMLSymbols } from './geometry';
import { PlaitImage } from './image';
import { PlaitLine } from './line';
import { PlaitSwimlane, SwimlaneSymbols } from './swimlane';
import { PlaitBaseTable, PlaitTable, PlaitTableElement, TableSymbols } from './table';
import { PlaitText } from './text';

export * from './line';
export * from './geometry';
export * from './text';
export * from './element';
export * from './engine';
export * from './swimlane';
export * from './table';

export type PlaitDrawElement = PlaitGeometry | PlaitLine | PlaitImage | PlaitBaseTable | PlaitSwimlane;

export type PlaitShapeElement = PlaitGeometry | PlaitImage | PlaitTable | PlaitSwimlane;

export type DrawShapes = GeometryShapes | TableSymbols | SwimlaneSymbols;

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
            PlaitDrawElement.isTable(value) ||
            PlaitDrawElement.isSwimlane(value)
        ) {
            return true;
        } else {
            return false;
        }
    },
    isShapeElement: (value: any): value is PlaitShapeElement => {
        return PlaitDrawElement.isImage(value) || PlaitDrawElement.isGeometry(value) || PlaitDrawElement.isTable(value) || PlaitDrawElement.isSwimlane(value);
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
    isSwimlane: (value: any): value is PlaitSwimlane => {
        return value.type === 'swimlane';
    },
    isVerticalSwimlane: (value: any) => {
        return PlaitDrawElement.isSwimlane(value) && value.shape === SwimlaneSymbols.swimlaneVertical;
    },
    isHorizontalSwimlane: (value: any) => {
        return PlaitDrawElement.isSwimlane(value) && value.shape === SwimlaneSymbols.swimlaneHorizontal;
    },
    isUMLClassOrInterface: (value: any) => {
        return Object.keys(UMLSymbols).includes(value.shape) && [UMLSymbols.class, UMLSymbols.interface].includes(value.shape);
    },
    isGeometryByTable: (value: any): value is PlaitBaseTable => {
        return PlaitDrawElement.isUMLClassOrInterface(value);
    },
    isElementByTable: (value: any): value is PlaitBaseTable => {
        return PlaitDrawElement.isTable(value) || PlaitDrawElement.isSwimlane(value) || PlaitDrawElement.isGeometryByTable(value);
    },
};
