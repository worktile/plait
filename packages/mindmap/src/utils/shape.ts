import { MindmapNodeShape } from '../constants';
import { MindmapElement } from '../interfaces';
import { findParentElement } from './mindmap';

export const getNodeShapeByElement = (element: MindmapElement): MindmapNodeShape => {
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
    return MindmapNodeShape.roundRectangle;
};
