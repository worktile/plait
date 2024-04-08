import { PlaitBoard, PlaitElement } from '../interfaces';
import {
    getHighestSelectedGroups,
    getSelectedIsolatedElementsCanAddToGroup,
    createGroup,
    canAddGroup,
    hasSelectedElementsInSameGroup,
    canRemoveGroup,
    findElements
} from '../utils';
import { NodeTransforms } from './node';

export const addGroup = (board: PlaitBoard, elements?: PlaitElement[]) => {
    const selectedGroups = getHighestSelectedGroups(board, elements);
    const selectedIsolatedElements = getSelectedIsolatedElementsCanAddToGroup(board);
    const highestSelectedElements = [...selectedGroups, ...selectedIsolatedElements];
    const group = createGroup();
    if (canAddGroup(board)) {
        highestSelectedElements.forEach(item => {
            const path = PlaitBoard.findPath(board, item);
            NodeTransforms.setNode(board, { groupId: group.id }, path);
        });
        if (hasSelectedElementsInSameGroup(highestSelectedElements)) {
            const newGroupId = selectedIsolatedElements[0].groupId;
            NodeTransforms.insertNode(
                board,
                {
                    ...group,
                    groupId: newGroupId
                },
                [board.children.length]
            );
        } else {
            NodeTransforms.insertNode(board, group, [board.children.length]);
        }
    }
};

export const removeGroup = (board: PlaitBoard, elements?: PlaitElement[]) => {
    const selectedGroups = getHighestSelectedGroups(board, elements);
    if (canRemoveGroup(board)) {
        selectedGroups.map(group => {
            const elementsInGroup = findElements(board, {
                match: item => item.groupId === group.id,
                recursion: () => false
            });
            elementsInGroup.forEach(item => {
                const path = PlaitBoard.findPath(board, item);
                NodeTransforms.setNode(board, { groupId: group.groupId || undefined }, path);
            });
            const groupPath = PlaitBoard.findPath(board, group);
            NodeTransforms.removeNode(board, groupPath);
        });
    }
};

export const GroupTransforms = {
    addGroup,
    removeGroup
};
