import { PlaitBoard, PlaitElement } from '../interfaces';
import { PlaitGroup, PlaitGroupElement } from '../interfaces/group';
import { getRectangleByElements } from './element';
import { getSelectedElements } from './selected-element';

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

export const getRelatedElements = (board: PlaitBoard, elements: PlaitElement[]) => {
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

export const getNewSelectedElements = (board: PlaitBoard, elements: PlaitElement[]) => {
    const selectedElements = getSelectedElements(board);
    let group: PlaitGroup;
    let newSelectedElements: PlaitElement[] = [...elements];

    if (elements.length === 1 && selectedElements.length > 1) {
        const groups = getGroupByElement(board, elements[0], true) as PlaitGroup[];
        if (groups?.length) {
            let selectedGroupIndex = -1;
            for (let i = groups.length - 1; i >= 0; i--) {
                const groupElements = getElementsByGroup(board, groups[i], true);
                if (groupElements.every(item => selectedElements.includes(item))) {
                    selectedGroupIndex = i;
                    break;
                }
            }
            if (selectedGroupIndex > 0) {
                group = groups[selectedGroupIndex - 1];
                newSelectedElements = getElementsByGroup(board, group, true);
            }
        }
    } else {
        newSelectedElements = getRelatedElements(board, elements);
    }
    return newSelectedElements;
};

export const getCommonElements = (board: PlaitBoard, elements: PlaitElement[]) => {
    let result: PlaitElement[] = [];
    elements.forEach(element => {
        if (element.groupId) {
            if (!result.find(item => item.id === element.groupId)) {
                const group = getGroupByElement(board, element, false) as PlaitGroup;
                const elementsInGroup = getElementsByGroup(board, group, false, true);
                if (elementsInGroup.every(item => elements.includes(item))) {
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
