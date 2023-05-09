import { MindElement } from '../interfaces';
import {
    findParentElement,
    getAvailableSubLayoutsByLayoutDirections,
    getBranchDirectionsByLayouts,
} from '../utils';
import { MindLayoutType } from '@plait/layouts';
import { getBranchLayouts } from './get-branch-layouts';

/**
 *  get available sub layouts by element
 * @param element
 * @returns MindLayoutType[]
 */
export const getAvailableSubLayoutsByElement = (element: MindElement) => {
    const parentElement = findParentElement(element);
    if (parentElement) {
        const branchLayouts = getBranchLayouts(parentElement);
        if (branchLayouts[0] === MindLayoutType.standard) {
            const node = MindElement.getNode(element);
            branchLayouts[0] = node.left ? MindLayoutType.left : MindLayoutType.right;
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
