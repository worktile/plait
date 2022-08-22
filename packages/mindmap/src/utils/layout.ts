import { MindmapElement } from "../interfaces";
import { findParentElement, findUpElement } from "./mindmap";

export const getLayoutByElement = (element: MindmapElement) => {
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
    return undefined;
};