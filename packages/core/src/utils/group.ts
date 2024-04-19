import { ACTIVE_STROKE_WIDTH } from '../constants';
import { Path, PlaitBoard, PlaitElement, PlaitGroup, PlaitGroupElement, RectangleClient, SELECTION_BORDER_COLOR } from '../interfaces';
import { getSelectionAngle } from './angle';
import { createG, setAngleForG } from './dom';
import { drawRectangle } from './drawing/rectangle';
import { getRectangleByElements } from './element';
import { idCreator } from './id-creator';
import { cacheSelectedElements, getSelectedElements } from './selected-element';
import { isSelectionMoving } from './selection';
import { depthFirstRecursion } from './tree';
import { moveElementsToNewPath } from './common';
import { sortElements } from './position';

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

export const getAllElementsInGroup = (board: PlaitBoard, group: PlaitGroup, recursion?: boolean, includeGroup?: boolean) => {
    const elementsInGroup = getElementsInGroup(board, group, recursion, includeGroup);
    const result: PlaitElement[] = [];
    elementsInGroup.forEach(element => {
        depthFirstRecursion(
            element,
            node => {
                result.push(node);
            },
            () => true
        );
    });
    return result;
};

export const getRectangleByGroup = (board: PlaitBoard, group: PlaitGroup, recursion?: boolean) => {
    const elementsInGroup = getAllElementsInGroup(board, group, recursion) as PlaitElement[];
    return getRectangleByElements(board, elementsInGroup, false);
};

export const getGroupByElement = (
    board: PlaitBoard,
    element: PlaitElement,
    recursion?: boolean,
    source?: PlaitElement[]
): PlaitGroup | PlaitGroup[] | null => {
    const group = (source || board.children).find(item => item.id === element?.groupId);
    if (!group) {
        return recursion ? [] : null;
    }
    if (recursion) {
        const groups = [group];
        const grandGroups = getGroupByElement(board, group, recursion, source) as PlaitGroup[];
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
        return getAllElementsInGroup(board, highestGroup, true) as PlaitGroup[];
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
    const hitElementGroups = getGroupByElement(board, element, true, elements) as PlaitGroup[];
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
    selectedElements
        .filter(item => !PlaitGroupElement.isGroup(item))
        .forEach(item => {
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

export const getSelectedIsolatedElementsCanAddToGroup = (board: PlaitBoard, elements?: PlaitElement[]) => {
    const selectedIsolatedElements = getSelectedIsolatedElements(board, elements);
    return selectedIsolatedElements.filter(item => board.canAddToGroup(item));
};

export const getHighestSelectedElements = (board: PlaitBoard, elements?: PlaitElement[]) => {
    return [...getHighestSelectedGroups(board, elements), ...getSelectedIsolatedElements(board, elements)];
};

export const createGroupRectangleG = (board: PlaitBoard, elements: PlaitElement[]): SVGGElement | null => {
    const selectedElementIds = getSelectedElements(board).map(item => item.id);
    let groupRectangleG: SVGGElement | null = null;
    const isMoving = isSelectionMoving(board);

    elements.forEach(item => {
        const isRender = (!selectedElementIds.includes(item.id) && !isMoving) || isMoving;
        if (item.groupId && isRender) {
            groupRectangleG = createG();
            const elements = getElementsInGroupByElement(board, item);
            const rectangle = getRectangleByElements(board, elements, false);
            const rectangleG = drawRectangle(board, rectangle, {
                stroke: SELECTION_BORDER_COLOR,
                strokeWidth: ACTIVE_STROKE_WIDTH,
                strokeLineDash: [5]
            });
            const angle = getSelectionAngle(elements);
            if (angle) {
                setAngleForG(rectangleG, RectangleClient.getCenterPoint(rectangle), angle);
            }
            groupRectangleG.append(rectangleG);
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

export const canAddGroup = (board: PlaitBoard, elements?: PlaitElement[]) => {
    const highestSelectedElements = getHighestSelectedElements(board, elements);
    const rootElements = highestSelectedElements.filter(item => board.canAddToGroup(item));
    if (rootElements.length > 1) {
        return nonGroupInHighestSelectedElements(rootElements) || hasSelectedElementsInSameGroup(rootElements);
    }
    return false;
};

export const canRemoveGroup = (board: PlaitBoard, elements?: PlaitElement[]) => {
    const selectedGroups = getHighestSelectedGroups(board, elements);
    const selectedElements = elements || getSelectedElements(board);
    return selectedElements.length > 0 && selectedGroups.length > 0;
};

export const getEditingGroup = (board: PlaitBoard, element: PlaitElement) => {
    const groups = getGroupByElement(board, element, true) as PlaitGroup[];
    let editingGroup = null;
    if (groups?.length) {
        for (let i = 0; i < groups?.length; i++) {
            if (!isSelectedAllElementsInGroup(board, groups[i])) {
                editingGroup = groups[i];
                break;
            }
        }
    }
    return editingGroup;
};

export const moveElementsToNewPathAfterAddGroup = (board: PlaitBoard, selectedElements: PlaitElement[], newPath: Path) => {
    const moveElements = [...selectedElements];
    sortElements(board, moveElements);
    moveElements.pop();
    moveElementsToNewPath(
        board,
        moveElements.map(element => {
            return {
                element,
                newPath
            };
        })
    );
};
