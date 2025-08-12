import { PlaitBoard } from '@plait/core';
import { BasicShapes, PlaitDrawElement, PlaitGeometry, PlaitShapeElement, TableSymbols } from '../interfaces';
import { DrawPointerType } from '../constants/pointer';
import { GeometryShapeGenerator, TableGenerator } from '../generators';

export const getElementShape = (value: PlaitShapeElement) => {
    if (PlaitDrawElement.isImage(value)) {
        return BasicShapes.rectangle;
    }
    if (PlaitDrawElement.isTable(value)) {
        return TableSymbols.table;
    }
    return value.shape;
};

export const getGeometryGeneratorByShape = (board: PlaitBoard, shape: DrawPointerType) => {
    if (PlaitDrawElement.isUMLClassOrInterface({ shape: shape })) {
        return new TableGenerator<PlaitGeometry>(board);
    } else {
        return new GeometryShapeGenerator(board);
    }
};
