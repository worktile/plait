import { BasicShapes, PlaitDrawElement, PlaitShapeElement, TableSymbols } from '../interfaces';

export const getElementShape = (value: PlaitShapeElement) => {
    if (PlaitDrawElement.isImage(value)) {
        return BasicShapes.rectangle;
    }
    if (PlaitDrawElement.isTable(value)) {
        return TableSymbols.table;
    }
    return value.shape;
};
