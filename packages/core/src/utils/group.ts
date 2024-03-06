import { ACTIVE_STROKE_WIDTH } from '../constants';
import { PlaitBoard, PlaitElement, SELECTION_BORDER_COLOR } from '../interfaces';
import { PlaitGroup, PlaitGroupElement } from '../interfaces/group';
import { Transforms } from '../transforms';
import { createG } from './dom';
import { drawRectangle } from './drawing/rectangle';
import { findElements, getRectangleByElements } from './element';
import { idCreator } from './id-creator';
import { getSelectedElements } from './selected-element';
import { isSelectionMoving } from './selection';

export const getElementsByGroup = (board: PlaitBoard, group: PlaitGroup, recursion?: boolean, includeGroup?: boolean) => {
    let result: PlaitElement[] = [];
    if (group) {
        const elements = board.children.filter(value => (value as PlaitElement).groupId === group.id) as PlaitElement[];
        if (recursion) {
            elements.forEach(item => {
                if (PlaitGroupElement.isGroup(item)) {
                    if (includeGroup) {
                        result.push(item);
                    }
                    result.push(...getElementsByGroup(board, item, recursion));
                } else {
                    result.push(item);
                }
            });
        } else {
            result = includeGroup ? elements : (elements.filter(item => !PlaitGroupElement.isGroup(item)) as PlaitElement[]);
        }
    }
    return result;
};

export const getRectangleByGroup = (board: PlaitBoard, group: PlaitGroup, recursion?: boolean) => {
    const elementsInGroup = getElementsByGroup(board, group, recursion) as PlaitElement[];
    return getRectangleByElements(board, elementsInGroup, false);
};

export const getGroupByElement = (board: PlaitBoard, element: PlaitElement, recursion?: boolean): PlaitGroup | PlaitGroup[] | null => {
    const group = board.children.find(item => item.id === element?.groupId);
    if (!group) {
        return recursion ? [] : null;
    }
    if (recursion) {
        const groups = [group];
        const grandGroups = getGroupByElement(board, group, recursion) as PlaitGroup[];
        if (grandGroups.length) {
            groups.push(...grandGroups);
        }
        return groups as PlaitGroup[];
    } else {
        return group as PlaitGroup;
    }
};

export const getHighestGroup = (board: PlaitBoard, element: PlaitElement) => {
    const groups = getGroupByElement(board, element, true) as PlaitGroup[];
    if (groups.length) {
        return groups[groups.length - 1];
    }
    return null;
};

export const getElementsInGroupByElement = (board: PlaitBoard, element: PlaitElement) => {
    const highestGroup = getHighestGroup(board, element);
    if (highestGroup) {
        return getElementsByGroup(board, highestGroup, true) as PlaitGroup[];
    } else {
        return [element];
    }
};

export const isSelectAllElementsInGroup = (board: PlaitBoard, group: PlaitGroup, selectedElements: PlaitElement[]) => {
    const groupElements = getElementsByGroup(board, group, true);
    return groupElements.every(item => selectedElements.includes(item));
};

export const getSelectedGroups = (board: PlaitBoard, groups: PlaitGroup[]) => {
    const selectedElements = getSelectedElements(board);
    const selectedGroups: PlaitGroup[] = [];
    groups.forEach(group => {
        if (isSelectAllElementsInGroup(board, group, selectedElements)) {
            selectedGroups.push(group);
        }
    });
    return selectedGroups;
};

export const getSelectedGroupsAndElements = (board: PlaitBoard): PlaitElement[] => {
    let result: PlaitElement[] = [];
    const selectedElements = getSelectedElements(board);

    const findHighestSelectedGroup = (element: PlaitGroup): PlaitGroup => {
        const group = getGroupByElement(board, element) as PlaitGroup;
        if (group) {
            if (isSelectAllElementsInGroup(board, group, selectedElements)) {
                return findHighestSelectedGroup(group);
            }
            return element;
        }
        return element;
    };

    selectedElements.forEach(element => {
        if (element.groupId) {
            const groups = getGroupByElement(board, element, true) as PlaitGroup[];
            if (!result.find(item => groups.includes(item as PlaitGroup))) {
                if (isSelectAllElementsInGroup(board, groups[0], selectedElements)) {
                    result.push(findHighestSelectedGroup(groups[0]));
                } else {
                    result.push(element);
                }
            }
        } else {
            result.push(element);
        }
    });
    return result;
};

export const isPartialSelect = (board: PlaitBoard, group: PlaitGroup) => {
    const groupElements = getElementsByGroup(board, group, false, true);
    const selectedGroupsAndElements = getSelectedGroupsAndElements(board);

    if (selectedGroupsAndElements.find(item => item.id === group.id)) {
        return false;
    }
    if (
        groupElements.some(item => selectedGroupsAndElements.includes(item)) &&
        !groupElements.every(item => selectedGroupsAndElements.includes(item))
    ) {
        return true;
    }
    return false;
};

export const addGroupRectangleG = (board: PlaitBoard, elements: PlaitElement[]): SVGGElement | null => {
    const selectedElements = getSelectedElements(board);
    const groupRectangleG: SVGGElement = createG();
    const isMoving = isSelectionMoving(board);

    elements.forEach(item => {
        const isRender = (!selectedElements.includes(item) && !isMoving) || isMoving;
        if (item.groupId && isRender) {
            const elements = getElementsInGroupByElement(board, item);
            const rectangle = getRectangleByElements(board, elements, false);
            groupRectangleG.append(
                drawRectangle(board, rectangle, {
                    stroke: SELECTION_BORDER_COLOR,
                    strokeWidth: ACTIVE_STROKE_WIDTH,
                    strokeLineDash: [5]
                })
            );
        }
    });
    return groupRectangleG;
};

export const createGroup = (): PlaitGroup => {
    return {
        id: idCreator(),
        type: 'group'
    };
};

export const addGroup = (board: PlaitBoard) => {
    const selectedGroupsAndElements = getSelectedGroupsAndElements(board);
    const group = createGroup();
    selectedGroupsAndElements.forEach(item => {
        const path = PlaitBoard.findPath(board, item);
        Transforms.setNode(board, { groupId: group.id }, path);
    });
    Transforms.insertNode(board, group, [board.children.length]);
};

export const removeGroup = (board: PlaitBoard) => {
    const selectedGroupsAndElements = getSelectedGroupsAndElements(board);
    const elementsWithGroup = selectedGroupsAndElements.filter(item => item.groupId || PlaitGroupElement.isGroup(item));
    if (elementsWithGroup.every(item => PlaitGroupElement.isGroup(item))) {
        (elementsWithGroup as PlaitGroup[]).forEach(group => {
            const groupElements = findElements(board, {
                match: item => item.groupId === group.id,
                recursion: () => false
            });
            groupElements.forEach(item => {
                const path = PlaitBoard.findPath(board, item);
                Transforms.setNode(board, { groupId: group.groupId || undefined }, path);
            });
        });
    } else {
        elementsWithGroup.forEach(item => {
            const path = PlaitBoard.findPath(board, item);
            Transforms.setNode(board, { groupId: undefined }, path);
        });
    }
};

export const isSelectGroup = (board: PlaitBoard) => {
    const selectedGroupsAndElements = getSelectedGroupsAndElements(board);
    return selectedGroupsAndElements.some(item => PlaitGroupElement.isGroup(item));
};

export const isPartialSelectGroup = (board: PlaitBoard) => {
    const selectedElements = getSelectedElements(board);
    for (let i = 0; i < selectedElements.length; i++) {
        const highestGroup = getHighestGroup(board, selectedElements[i]);
        return highestGroup && isPartialSelect(board, highestGroup);
    }
    return false;
};
