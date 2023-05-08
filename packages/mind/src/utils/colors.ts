import { COLORS, ROOT_NODE_STROKE } from '../constants';
import { MindElement } from '../interfaces';
import { findUpElement } from './mindmap';

export const getStrokeByMindmapElement = (element: MindElement) => {
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

export const getLinkLineColorByMindmapElement = (element: MindElement) => {
    let color = element.linkLineColor;
    if (color) {
        return color;
    }
    const { root, branch } = findUpElement(element);
    if (branch) {
        const index = root.children.indexOf(branch);
        const length = COLORS.length;
        const remainder = index % length;
        return COLORS[remainder];
    } else {
        throw new Error('root element should not have link line');
    }
};

export const getRootLinkLineColorByMindmapElement = (root: MindElement) => {
    const index = root.children.length;
    const length = COLORS.length;
    const remainder = index % length;
    return COLORS[remainder];
};
