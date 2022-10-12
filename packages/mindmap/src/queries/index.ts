import { getAvailableSubLayoutsByElement } from './get-available-sublayouts-by-element';
import { getBranchMindmapLayouts } from './get-branch-mindmap-layouts-by-element';
import { getCorrectLayoutByElement } from './get-correct-layout-by-element';
import { getLayoutByElement } from './get-layout-by-element';
import { getLayoutParentByElement } from './get-layout-parent-by-element';

export const MindmapQueries = {
    getAvailableSubLayoutsByElement,
    getLayoutParentByElement,
    getBranchMindmapLayouts,
    getLayoutByElement,
    getCorrectLayoutByElement
};
