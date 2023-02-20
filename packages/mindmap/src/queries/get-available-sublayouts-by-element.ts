import { MindmapNodeElement } from '../interfaces';
import {
    findParentElement,
    getAvailableSubLayoutsByLayoutDirections,
    getBranchDirectionsByLayouts,
    MINDMAP_ELEMENT_TO_COMPONENT
} from '../utils';
import { MindmapLayoutType } from '@plait/layouts';
import { getBranchMindmapLayouts } from './get-branch-mindmap-layouts-by-element';

/**
 *  get available sub layouts by element
 * @param element
 * @returns MindmapLayoutType[]
 */
export const getAvailableSubLayoutsByElement = (element: MindmapNodeElement) => {
    const parentElement = findParentElement(element);
    if (parentElement) {
        const branchLayouts = getBranchMindmapLayouts(parentElement);
        if (branchLayouts[0] === MindmapLayoutType.standard) {
            const component = MINDMAP_ELEMENT_TO_COMPONENT.get(element);
            if (component) {
                branchLayouts[0] = component.node.left ? MindmapLayoutType.left : MindmapLayoutType.right;
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
