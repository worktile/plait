import { GeometryShape, PlaitDrawElement, PlaitShape } from '../interfaces';

export const getShape = (value: PlaitShape) => {
    if (PlaitDrawElement.isImage(value)) {
        return GeometryShape.rectangle;
    }
    return value.shape;
};
