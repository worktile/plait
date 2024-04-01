import { BasicShapes, PlaitDrawElement, PlaitShapeElement } from '../interfaces';

export const getElementShape = (value: PlaitShapeElement) => {
    if (PlaitDrawElement.isImage(value)) {
        return BasicShapes.rectangle;
    }
    return value.shape;
};
