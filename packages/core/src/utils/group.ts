import { ACTIVE_STROKE_WIDTH } from '../constants';
import { PlaitBoard, PlaitElement, SELECTION_BORDER_COLOR } from '../interfaces';
import { PlaitGroup, PlaitGroupElement } from '../interfaces/group';
import { createG } from './dom';
import { drawRectangle } from './drawing/rectangle';
import { getRectangleByElements } from './element';
import { getSelectedElements } from './selected-element';
import { isSelectionMoving } from './selection';

export const getElementsByGroup = (board: PlaitBoard, group: PlaitGroup, recursion?: boolean, includeGroup?: boolean) => {
    let result: PlaitElement[] = [];
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

export const replenishGroupElements = (board: PlaitBoard, elements: PlaitElement[]) => {
    const result: PlaitElement[] = [];
    elements.forEach(item => {
        if (!item.groupId) {
            result.push(item);
        } else {
            const groups = getGroupByElement(board, item, true) as PlaitGroup[];
            result.push(...getElementsByGroup(board, groups[groups.length - 1], true));
        }
    });
    return result;
};

export const isSelectGroup = (board: PlaitBoard, group: PlaitGroup, selectedElements: PlaitElement[]) => {
    const groupElements = getElementsByGroup(board, group, true);
    return groupElements.every(item => selectedElements.includes(item));
};

export const getSelectedGroups = (board: PlaitBoard, groups: PlaitGroup[]) => {
    const selectedElements = getSelectedElements(board);
    const selectedGroups: PlaitGroup[] = [];
    groups.forEach(group => {
        if (isSelectGroup(board, group, selectedElements)) {
            selectedGroups.push(group);
        }
    });
    return selectedGroups;
};

export const isSelectedElementsIncludeGroup = (selectedGroups: PlaitGroup[]) => {
    return selectedGroups.length > 0;
};

export const getSelectGroupsAndElements = (board: PlaitBoard): PlaitElement[] => {
    let result: PlaitElement[] = [];
    const selectedElements = getSelectedElements(board);
    selectedElements.forEach(element => {
        if (element.groupId) {
            if (!result.find(item => item.id === element.groupId)) {
                const group = getGroupByElement(board, element) as PlaitGroup;
                if (isSelectGroup(board, group, selectedElements)) {
                    result.push(group);
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

export const isPartialSelectGroup = (board: PlaitBoard, group: PlaitGroup) => {
    const groupElements = getElementsByGroup(board, group, false, true);
    const selectedGroupsAndElements = getSelectGroupsAndElements(board);

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

export function createGroupRectangleG(board: PlaitBoard, elements: PlaitElement[]): SVGGElement | null {
    const selectedElements = getSelectedElements(board);
    const groupRectangleG: SVGGElement = createG();
    const isMoving = isSelectionMoving(board);

    elements.forEach(item => {
        const isRender = (!selectedElements.includes(item) && !isMoving) || isMoving;
        if (item.groupId && isRender) {
            const elements = replenishGroupElements(board, [item]);
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
}
