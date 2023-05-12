import { COLORS, ROOT_NODE_STROKE } from '../constants';
import { MindElement } from '../interfaces';
import { findUpElement } from './mind';

export const getStrokeByMindElement = (element: MindElement) => {
    let stroke = element.strokeColor;
    if (stroke) {
        return stroke;
    }
    const { root, branch } = findUpElement(element);
    if (branch) {
        const index = root.children.indexOf(branch);
        const length = COLORS.length;
        const remainder = index % length;
        return COLORS[remainder];
    } else {
        return ROOT_NODE_STROKE;
    }
};
