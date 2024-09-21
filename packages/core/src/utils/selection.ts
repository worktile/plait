import { ACTIVE_STROKE_WIDTH, SELECTION_RECTANGLE_BOUNDING_CLASS_NAME, SELECTION_RECTANGLE_CLASS_NAME } from '../constants';
import {
    PlaitBoard,
    PlaitElement,
    PlaitGroup,
    PlaitOperation,
    PlaitPluginKey,
    PlaitPointerType,
    RectangleClient,
    SELECTION_BORDER_COLOR,
    WithSelectionPluginOptions
} from '../interfaces';
import { setDragging } from './dnd';
import { getRectangleByElements } from './element';
import { BOARD_TO_IS_SELECTION_MOVING, BOARD_TO_TEMPORARY_ELEMENTS } from './weak-maps';
import { drawRectangle } from './drawing/rectangle';
import { cacheSelectedElements, getSelectedElements } from './selected-element';
import { getSelectionAngle, setAngleForG } from './angle';
import { filterSelectedGroups, getAllElementsInGroup, getElementsInGroup, getElementsInGroupByElement, getGroupByElement } from './group';
import { uniqueById } from './helper';
import { Selection } from '../interfaces/selection';
import { PlaitOptionsBoard } from '../plugins/with-options';

export function isSelectionMoving(board: PlaitBoard) {
    return !!BOARD_TO_IS_SELECTION_MOVING.get(board);
}

export function setSelectionMoving(board: PlaitBoard) {
    PlaitBoard.getBoardContainer(board).classList.add('selection-moving');
    BOARD_TO_IS_SELECTION_MOVING.set(board, true);
    setDragging(board, true);
}

export function clearSelectionMoving(board: PlaitBoard) {
    PlaitBoard.getBoardContainer(board).classList.remove('selection-moving');
    BOARD_TO_IS_SELECTION_MOVING.delete(board);
    setDragging(board, false);
}

export function isHandleSelection(board: PlaitBoard) {
    const options = getSelectionOptions(board);
    return board.pointer !== PlaitPointerType.hand && !options.isDisabledSelection && !PlaitBoard.isReadonly(board);
}

export function hasSetSelectionOperation(board: PlaitBoard) {
    return !!board.operations.find(op => PlaitOperation.isSetSelectionOperation(op));
}

export function getTemporaryElements(board: PlaitBoard) {
    const ref = BOARD_TO_TEMPORARY_ELEMENTS.get(board);
    if (ref) {
        return ref.elements;
    } else {
        return undefined;
    }
}

export function getTemporaryRef(board: PlaitBoard) {
    return BOARD_TO_TEMPORARY_ELEMENTS.get(board);
}

export function deleteTemporaryElements(board: PlaitBoard) {
    BOARD_TO_TEMPORARY_ELEMENTS.delete(board);
}

export function drawSelectionRectangleG(board: PlaitBoard) {
    const elements = getSelectedElements(board);
    const rectangle = getRectangleByElements(board, elements, false);
    if (rectangle.width > 0 && rectangle.height > 0 && elements.length > 1) {
        const selectionRectangleG = drawRectangle(board, RectangleClient.inflate(rectangle, ACTIVE_STROKE_WIDTH), {
            stroke: SELECTION_BORDER_COLOR,
            strokeWidth: ACTIVE_STROKE_WIDTH,
            fillStyle: 'solid'
        });
        selectionRectangleG.classList.add(SELECTION_RECTANGLE_CLASS_NAME, SELECTION_RECTANGLE_BOUNDING_CLASS_NAME);
        const angle = getSelectionAngle(elements);
        if (angle) {
            setAngleForG(selectionRectangleG, RectangleClient.getCenterPoint(rectangle), angle);
        }
        return selectionRectangleG;
    }
    return null;
}

export function setSelectedElementsWithGroup(board: PlaitBoard, elements: PlaitElement[], isShift: boolean) {
    if (!board.selection) {
        return;
    }
    const selectedElements = getSelectedElements(board);
    if (!Selection.isCollapsed(board.selection)) {
        let newElements = [...selectedElements];
        elements.forEach(item => {
            if (!item.groupId) {
                newElements.push(item);
            } else {
                newElements.push(...getElementsInGroupByElement(board, item));
            }
        });
        cacheSelectedElements(board, uniqueById(newElements));
        return;
    }
    if (Selection.isCollapsed(board.selection)) {
        const hitElement = elements[0];
        const hitElementGroups = getGroupByElement(board, hitElement, true) as PlaitGroup[];
        if (hitElementGroups.length) {
            const elementsInHighestGroup = getElementsInGroup(board, hitElementGroups[hitElementGroups.length - 1], true) || [];
            const isSelectGroupElement = selectedElements.some(element => elementsInHighestGroup.map(item => item.id).includes(element.id));
            if (isShift) {
                cacheSelectedElementsWithGroupOnShift(board, elements, isSelectGroupElement, elementsInHighestGroup);
            } else {
                cacheSelectedElementsWithGroup(board, elements, isSelectGroupElement, hitElementGroups);
            }
        }
    }
}

export function cacheSelectedElementsWithGroupOnShift(
    board: PlaitBoard,
    elements: PlaitElement[],
    isSelectGroupElement: boolean,
    elementsInHighestGroup: PlaitElement[]
) {
    const selectedElements = getSelectedElements(board);
    let newElements = [...selectedElements];
    const hitElement = elements[0];
    let pendingElements: PlaitElement[] = [];
    if (!isSelectGroupElement) {
        pendingElements = elementsInHighestGroup;
    } else {
        const isHitSelectedElement = selectedElements.some(item => item.id === hitElement.id);
        const selectedElementsInGroup = elementsInHighestGroup.filter(item => selectedElements.includes(item));
        if (isHitSelectedElement) {
            pendingElements = selectedElementsInGroup.filter(item => item.id !== hitElement.id);
        } else {
            pendingElements.push(...selectedElementsInGroup, ...elements);
        }
    }
    elementsInHighestGroup.forEach(element => {
        if (newElements.includes(element)) {
            newElements.splice(newElements.indexOf(element), 1);
        }
    });
    if (pendingElements.length) {
        newElements.push(...pendingElements);
    }
    cacheSelectedElements(board, uniqueById(newElements));
}

export function cacheSelectedElementsWithGroup(
    board: PlaitBoard,
    elements: PlaitElement[],
    isSelectGroupElement: boolean,
    hitElementGroups: PlaitGroup[]
) {
    let newElements = [...elements];
    const selectedGroups = filterSelectedGroups(board, hitElementGroups);
    if (selectedGroups.length > 0) {
        if (selectedGroups.length > 1) {
            newElements = getAllElementsInGroup(board, selectedGroups[selectedGroups.length - 2], true);
        }
    } else {
        const elementsInGroup = getAllElementsInGroup(board, hitElementGroups[hitElementGroups.length - 1], true);
        if (!isSelectGroupElement) {
            newElements = elementsInGroup;
        }
    }
    cacheSelectedElements(board, uniqueById(newElements));
}

export const getSelectionOptions = (board: PlaitBoard) => {
    const options = (board as PlaitOptionsBoard).getPluginOptions<WithSelectionPluginOptions>(PlaitPluginKey.withSelection);
    return options;
};

export const setSelectionOptions = (board: PlaitBoard, options: Partial<WithSelectionPluginOptions>) => {
    (board as PlaitOptionsBoard).setPluginOptions<WithSelectionPluginOptions>(PlaitPluginKey.withSelection, options);
};
