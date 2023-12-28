import { MindElement } from '../interfaces';
import { MindLayoutType } from '@plait/layouts';
import { getCorrectLayoutByElement } from './get-correct-layout-by-element';
import { PlaitBoard } from '@plait/core';

export const getBranchLayouts = (board: PlaitBoard, element: MindElement) => {
    const layouts: MindLayoutType[] = [];
    if (element.layout) {
        // TODO: getCorrectLayoutByElement Contains recursive operations. getBranchLayouts itself also has recursive operations and needs to be optimized.
        layouts.unshift(getCorrectLayoutByElement(board, element));
    }
    let parent = MindElement.findParent(element);
    while (parent) {
        if (parent.layout) {
            layouts.unshift(parent.layout);
        }
        parent = MindElement.findParent(parent);
    }
    return layouts;
};
