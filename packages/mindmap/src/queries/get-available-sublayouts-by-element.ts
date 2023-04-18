import { MindmapNodeElement } from '../interfaces';
import { ELEMENT_TO_NODE, findParentElement, getAvailableSubLayoutsByLayoutDirections, getBranchDirectionsByLayouts } from '../utils';
import { MindmapLayoutType } from '@plait/layouts';
import { getBranchMindmapLayouts } from './get-branch-mindmap-layouts-by-element';
import { ELEMENT_TO_PLUGIN_COMPONENT, PlaitBoard } from '@plait/core';

/**
 *  get available sub layouts by element
 * @param element
 * @returns MindmapLayoutType[]
 */
export const getAvailableSubLayoutsByElement = (board: PlaitBoard, element: MindmapNodeElement) => {
    const parentElement = findParentElement(element);
    if (parentElement) {
        const branchLayouts = getBranchMindmapLayouts(board, parentElement);
        if (branchLayouts[0] === MindmapLayoutType.standard) {
            const component = ELEMENT_TO_PLUGIN_COMPONENT.get(element);
            const node = ELEMENT_TO_NODE.get(element);
            if (node) {
                branchLayouts[0] = node.left ? MindmapLayoutType.left : MindmapLayoutType.right;
            }
        }
        const currentLayoutDirections = getBranchDirectionsByLayouts(branchLayouts);
        let availableSubLayouts = getAvailableSubLayoutsByLayoutDirections(currentLayoutDirections);
        const parentLayout = [branchLayouts[branchLayouts.length - 1]];
        const parentDirections = getBranchDirectionsByLayouts(parentLayout);
        const parentAvailableSubLayouts = getAvailableSubLayoutsByLayoutDirections(parentDirections);

        availableSubLayouts = availableSubLayouts.filter(layout =>
            parentAvailableSubLayouts.some(parentAvailableSubLayout => parentAvailableSubLayout === layout)
        );
        return availableSubLayouts;
    }
    return undefined;
};
