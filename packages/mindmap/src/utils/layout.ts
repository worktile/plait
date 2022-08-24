import { MindmapElement } from "../interfaces";
import { findParentElement, findUpElement } from "./mindmap";
import { LayoutType } from '@plait/layouts';

export const getLayoutByElement = (element: MindmapElement): string => {
    let layout = element.layout;
    if (layout) {
        return layout;
    }
    let parent = findParentElement(element);
    while (parent) {
        if (parent.layout) {
            return parent.layout;
        }
        parent = findParentElement(parent);
    }
    return LayoutType.logic;
};