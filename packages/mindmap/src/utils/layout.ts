import { MindmapElement, MindmapLayout } from "../interfaces";
import { findParentElement } from "./mindmap";

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
    return MindmapLayout.standard;
};