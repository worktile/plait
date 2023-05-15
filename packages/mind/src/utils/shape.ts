import { MindElement, MindElementShape } from '../interfaces';
import { findParentElement } from './mind';

export const getNodeShapeByElement = (element: MindElement): MindElementShape => {
    let nodeShape = element.shape;
    if (nodeShape) {
        return nodeShape;
    }
    let parent = findParentElement(element);

    while (parent) {
        if (parent.shape) {
            return parent.shape;
        }
        parent = findParentElement(parent);
    }
    return MindElementShape.roundRectangle;
};
