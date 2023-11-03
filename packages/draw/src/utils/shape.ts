import { BasicShapes, PlaitDrawElement, PlaitShape } from '../interfaces';

export const getShape = (value: PlaitShape) => {
    if (PlaitDrawElement.isImage(value)) {
        return BasicShapes.rectangle;
    }
    return value.shape;
};
