import { ACTIVE_STROKE_WIDTH } from '../constants';
import { PlaitBoard, PlaitElement, PlaitGroup, PlaitGroupElement, SELECTION_BORDER_COLOR } from '../interfaces';
import { Transforms } from '../transforms';
import { createG } from './dom';
import { drawRectangle } from './drawing/rectangle';
import { getRectangleByElements, findElements } from './element';
import { idCreator } from './id-creator';
import { getSelectedElements } from './selected-element';
import { isSelectionMoving } from './selection';

export const getElementsInGroup = (board: PlaitBoard, group: PlaitGroup, recursion?: boolean, includeGroup?: boolean) => {
    let result: PlaitElement[] = [];
    const elements = board.children.filter(value => (value as PlaitElement).groupId === group.id) as PlaitElement[];
    if (recursion) {
        elements.forEach(item => {
            if (PlaitGroupElement.isGroup(item)) {
                if (includeGroup) {
                    result.push(item);
                }
                result.push(...getElementsInGroup(board, item, recursion, includeGroup));
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
    const elementsInGroup = getElementsInGroup(board, group, recursion) as PlaitElement[];
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
    const hitElementGroups = getGroupByElement(board, element, true) as PlaitGroup[];
    if (hitElementGroups.length) {
        return hitElementGroups[hitElementGroups.length - 1];
    }
    return null;
};

export const getElementsInGroupByElement = (board: PlaitBoard, element: PlaitElement) => {
    const highestGroup = getHighestGroup(board, element);
    if (highestGroup) {
        return getElementsInGroup(board, highestGroup, true) as PlaitGroup[];
    } else {
        return [element];
    }
};

export const isSelectedElementOrGroup = (board: PlaitBoard, element: PlaitElement, elements?: PlaitElement[]) => {
    const selectedElements = elements || getSelectedElements(board);
    if (PlaitGroupElement.isGroup(element)) {
        return isSelectedAllElementsInGroup(board, element, elements);
    }
    return selectedElements.map(item => item.id).includes(element.id);
};

export const isSelectedAllElementsInGroup = (board: PlaitBoard, group: PlaitGroup, elements?: PlaitElement[]) => {
    const selectedElements = elements || getSelectedElements(board);
    const elementsInGroup = getElementsInGroup(board, group, true);
    return elementsInGroup.every(item => selectedElements.map(element => element.id).includes(item.id));
};

export const filterSelectedGroups = (board: PlaitBoard, groups: PlaitGroup[], elements?: PlaitElement[]): PlaitGroup[] => {
    const selectedGroups: PlaitGroup[] = [];
    groups.forEach(item => {
        if (isSelectedElementOrGroup(board, item, elements)) {
            selectedGroups.push(item);
        }
    });
    return selectedGroups;
};

export const getSelectedGroups = (board: PlaitBoard, elements?: PlaitElement[]): PlaitGroup[] => {
    const highestSelectedGroups = getHighestSelectedGroups(board, elements);
    const groups: PlaitGroup[] = [];
    highestSelectedGroups.forEach(item => {
        groups.push(item);
        const elementsInGroup = getElementsInGroup(board, item, true, true);
        groups.push(...(elementsInGroup.filter(item => PlaitGroupElement.isGroup(item)) as PlaitGroup[]));
    });
    return groups;
};

export const getHighestSelectedGroup = (board: PlaitBoard, element: PlaitElement, elements?: PlaitElement[]): PlaitGroup | null => {
    const hitElementGroups = getGroupByElement(board, element, true) as PlaitGroup[];
    const selectedGroups = filterSelectedGroups(board, hitElementGroups, elements);
    if (selectedGroups.length) {
        return selectedGroups[selectedGroups.length - 1];
    }
    return null;
};

export const getHighestSelectedGroups = (board: PlaitBoard, elements?: PlaitElement[]): PlaitGroup[] => {
    let result: PlaitGroup[] = [];
    const selectedElements = elements || getSelectedElements(board);
    selectedElements.forEach(item => {
        if (item.groupId) {
            const group = getHighestSelectedGroup(board, item, elements);
            if (group && !result.includes(group)) {
                result.push(group);
            }
        }
    });
    return result;
};

export const getSelectedIsolatedElements = (board: PlaitBoard, elements?: PlaitElement[]) => {
    let result: PlaitElement[] = [];
    const selectedElements = elements || getSelectedElements(board);
    selectedElements.forEach(item => {
        if (!item.groupId) {
            result.push(item);
        } else {
            const group = getHighestSelectedGroup(board, item, elements);
            if (!group) {
                result.push(item);
            }
        }
    });
    return result;
};

export const getHighestSelectedElements = (board: PlaitBoard, elements?: PlaitElement[]) => {
    return [...getHighestSelectedGroups(board, elements), ...getSelectedIsolatedElements(board, elements)];
};

export const createGroupRectangleG = (board: PlaitBoard, elements: PlaitElement[]): SVGGElement | null => {
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

export const createGroup = (groupId?: string): PlaitGroup => {
    return groupId
        ? {
              id: idCreator(),
              type: 'group',
              groupId
          }
        : {
              id: idCreator(),
              type: 'group'
          };
};

export const nonGroupInHighestSelectedElements = (elements: PlaitElement[]) => {
    return elements.every(item => !item.groupId);
};

export const hasSelectedElementsInSameGroup = (elements: PlaitElement[]) => {
    return elements.every(item => item.groupId && item.groupId === elements[0].groupId);
};

export const canAddGroup = (highestSelectedElements: PlaitElement[]) => {
    if (highestSelectedElements.length > 1) {
        return nonGroupInHighestSelectedElements(highestSelectedElements) || hasSelectedElementsInSameGroup(highestSelectedElements);
    }
    return false;
};

export const addGroup = (board: PlaitBoard) => {
    const selectedGroups = getHighestSelectedGroups(board);
    const selectedIsolatedElements = getSelectedIsolatedElements(board);
    const highestSelectedElements = [...selectedGroups, ...selectedIsolatedElements];
    const group = createGroup();
    if (canAddGroup(highestSelectedElements)) {
        highestSelectedElements.forEach(item => {
            const path = PlaitBoard.findPath(board, item);
            Transforms.setNode(board, { groupId: group.id }, path);
        });
        if (hasSelectedElementsInSameGroup(highestSelectedElements)) {
            const newGroupId = selectedIsolatedElements[0].groupId;
            Transforms.insertNode(
                board,
                {
                    ...group,
                    groupId: newGroupId
                },
                [board.children.length]
            );
        } else {
            Transforms.insertNode(board, group, [board.children.length]);
        }
    }
};

export const canRemoveGroup = (board: PlaitBoard, selectedGroups: PlaitGroup[]) => {
    const selectedElements = getSelectedElements(board);
    return selectedElements.length > 0 && selectedGroups.length > 0;
};

export const removeGroup = (board: PlaitBoard) => {
    const selectedGroups = getHighestSelectedGroups(board);
    if (canRemoveGroup(board, selectedGroups)) {
        selectedGroups.map(group => {
            const elementsInGroup = findElements(board, {
                match: item => item.groupId === group.id,
                recursion: () => false
            });
            elementsInGroup.forEach(item => {
                const path = PlaitBoard.findPath(board, item);
                Transforms.setNode(board, { groupId: group.groupId || undefined }, path);
            });
            const groupPath = PlaitBoard.findPath(board, group);
            Transforms.removeNode(board, groupPath);
        });
    }
};
