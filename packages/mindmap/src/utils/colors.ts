import { COLORS, TRANSPARENT } from '../constants';
import { MindmapElement } from '../interfaces';
import { findUpElement } from './mindmap';

export const getStrokeByMindmapElement = (element: MindmapElement) => {
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
        return TRANSPARENT;
    }
};

export const getLinkLineColorByMindmapElement = (element: MindmapElement) => {
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

export const getRootLinkLineColorByMindmapElement = (root: MindmapElement) => {
    const index = root.children.length;
    const length = COLORS.length;
    const remainder = index % length;
    return COLORS[remainder];
};
