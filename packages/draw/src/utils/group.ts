import { PlaitBoard, PlaitElement, getRectangleByElements } from '@plait/core';
import { PlaitDrawElement } from '../interfaces';
import { PlaitGroup, PlaitGroupElement } from '../interfaces/group';

export const getElementsByGroup = (board: PlaitBoard, group: PlaitGroup, recursion?: boolean) => {
    let result: PlaitElement[] = [];
    const elements = board.children.filter(value => (value as PlaitDrawElement).parentId === group.id) as PlaitElement[];
    if (recursion) {
        elements.forEach(item => {
            if (PlaitGroupElement.isGroup(item)) {
                result.push(...getElementsByGroup(board, item, recursion));
            } else {
                result.push(item);
            }
        });
    } else {
        result = elements.filter(item => !PlaitGroupElement.isGroup(item)) as PlaitElement[];
    }
    return result;
};

export const getRectangleByGroup = (board: PlaitBoard, group: PlaitGroup, recursion?: boolean) => {
    const elementsInGroup = getElementsByGroup(board, group, recursion) as PlaitElement[];
    return getRectangleByElements(board, elementsInGroup, false);
};

export const getGroupByElement = (board: PlaitBoard, element: PlaitElement, recursion?: boolean): PlaitGroup | PlaitGroup[] | null => {
    const group = board.children.find(item => item.id === element?.parentId);
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

export const getRelatedElements = (board: PlaitBoard, elements: PlaitElement[]) => {
    const result: PlaitElement[] = [];
    elements.forEach(item => {
        if (!item.parentId) {
            result.push(item);
        } else {
            const groups = getGroupByElement(board, item, true) as PlaitGroup[];
            result.push(...getElementsByGroup(board, groups[groups.length - 1], true));
        }
    });
    return result;
};

