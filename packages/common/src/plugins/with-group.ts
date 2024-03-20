import {
    PlaitBoard,
    PlaitPluginElementContext,
    PlaitGroupElement,
    toViewBoxPoint,
    toHostPoint,
    getHitElementsBySelection,
    createGroupRectangleG,
    ClipboardData,
    getHighestSelectedGroups,
    getSelectedIsolatedElements,
    PlaitElement,
    PlaitGroup,
    getSelectedGroups,
    Selection,
    Point,
    Transforms,
    idCreator,
    getSelectedElements,
    getGroupByElement,
    getElementsInGroup
} from '@plait/core';
import { GroupComponent } from '../core/group.component';

export function withGroup(board: PlaitBoard) {
    let groupRectangleG: SVGGElement | null;
    let removeGroups: PlaitGroup[] | null;

    const { drawElement, pointerMove, globalPointerUp, insertFragment, getDeletedFragment, deleteFragment, getRelatedFragment } = board;

    board.drawElement = (context: PlaitPluginElementContext) => {
        if (PlaitGroupElement.isGroup(context.element)) {
            return GroupComponent;
        }
        return drawElement(context);
    };

    board.pointerMove = (event: PointerEvent) => {
        groupRectangleG?.remove();
        const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        let selection: Selection = { anchor: point, focus: point };
        if (board.selection && !Selection.isCollapsed(board.selection)) {
            selection = board.selection;
        }
        const hitElements = getHitElementsBySelection(board, selection);
        if (hitElements.length) {
            groupRectangleG = createGroupRectangleG(board, hitElements);
            groupRectangleG && PlaitBoard.getElementActiveHost(board).append(groupRectangleG);
        }

        pointerMove(event);
    };

    board.globalPointerUp = (event: PointerEvent) => {
        groupRectangleG?.remove();
        groupRectangleG = null;
        globalPointerUp(event);
    };

    board.getRelatedFragment = (elements: PlaitElement[]) => {
        const selectedElements = getSelectedElements(board);
        const groups = getSelectedGroups(board, selectedElements);
        return getRelatedFragment([...elements, ...groups]);
    };

    board.insertFragment = (data: DataTransfer | null, clipboardData: ClipboardData | null, targetPoint: Point) => {
        if (clipboardData?.elements?.length) {
            const elements: PlaitElement[] = [];
            const groups = getHighestSelectedGroups(board, clipboardData?.elements);
            const selectedIsolatedElements = getSelectedIsolatedElements(board, clipboardData?.elements);
            selectedIsolatedElements.forEach(item => {
                elements.push(!item.groupId ? item : updateGroupId(item, undefined));
            });
            if (groups.length) {
                groups.forEach(item => {
                    const newGroup = { ...updateGroupId(item, undefined), id: idCreator() };
                    elements.push(newGroup);
                    elements.push(...updateElementsGroupId(item, clipboardData.elements!, newGroup.id));
                });
            }
            clipboardData.elements = elements;

            const groupElements = elements?.filter(value => PlaitGroupElement.isGroup(value)) as PlaitElement[];
            groupElements.forEach(element => {
                Transforms.insertNode(board, element, [board.children.length]);
            });
        }
        insertFragment(data, clipboardData, targetPoint);
    };

    board.getDeletedFragment = (data: PlaitElement[]) => {
        if (removeGroups && removeGroups.length) {
            data.push(...removeGroups);
        }
        return getDeletedFragment(data);
    };

    board.deleteFragment = (data: DataTransfer | null) => {
        removeGroups = getRemoveGroups(board);
        if (removeGroups?.length) {
            updateSiblingElementGroupId(board, removeGroups);
        }
        deleteFragment(data);
        removeGroups = null;
    };

    return board;
}

const updateGroupId = (element: PlaitElement, groupId?: string) => {
    return {
        ...element,
        groupId: groupId
    };
};

const updateElementsGroupId = (group: PlaitGroup, clipboardDataElements: PlaitElement[], newGroupId: string) => {
    const elements: PlaitElement[] = [];
    const elementsInGroup = clipboardDataElements.filter(item => item.groupId === group.id);
    if (elementsInGroup.length) {
        elementsInGroup.forEach(item => {
            if (PlaitGroupElement.isGroup(item)) {
                const newGroup = { ...updateGroupId(item, newGroupId), id: idCreator() };
                elements.push(newGroup);
                elements.push(...updateElementsGroupId(item, clipboardDataElements, newGroup.id));
            } else {
                elements.push(updateGroupId(item, newGroupId));
            }
        });
    }
    return elements;
};

const getRemoveGroups = (board: PlaitBoard) => {
    const selectedGroups = board.getRelatedFragment([]) as PlaitGroup[];
    const removeGroups = [...selectedGroups];
    const highestSelectedGroups = getHighestSelectedGroups(board);
    const selectedIsolatedElements = getSelectedIsolatedElements(board);
    const removeNodes = [...highestSelectedGroups, ...selectedIsolatedElements];
    removeNodes.forEach(item => {
        const groups = getGroupByElement(board, item, true) as PlaitGroup[];
        if (groups.length) {
            const elementsInGroup = getElementsInGroup(board, groups[0], false, true);
            const siblingElements = elementsInGroup.filter(
                element => ![...removeNodes, ...removeGroups].map(item => item.id).includes(element.id)
            );
            if (siblingElements.length === 1 || siblingElements.length === 0) {
                if (!removeGroups.includes(groups[0])) {
                    removeGroups.push(groups[0]);
                }
                if (siblingElements.length === 1) {
                    if (groups.length > 1) {
                        const aboveGroup = findAboveGroupWithAnotherNode(board, groups.slice(1, groups.length), [
                            ...removeNodes,
                            ...removeGroups
                        ]);
                        const index = groups.findIndex(item => item.id === aboveGroup.id);
                        [...groups.slice(1, index)].forEach(item => {
                            if (removeGroups.includes(item)) {
                                removeGroups.push(item);
                            }
                        });
                    }
                }
            }
        }
    });
    return removeGroups;
};

const findAboveGroupWithAnotherNode = (board: PlaitBoard, groups: PlaitGroup[], excludeNodes: PlaitElement[]) => {
    let group = groups[0];
    if (groups.length > 1) {
        for (let i = 0; i < groups.length; i++) {
            const elementsInGroup = getElementsInGroup(board, groups[i], false, true);
            const siblingElements = elementsInGroup.filter(element => !excludeNodes.map(item => item.id).includes(element.id));
            if (siblingElements.length > 0) {
                group = groups[i];
                break;
            }
        }
    }
    return group;
};

const updateSiblingElementGroupId = (board: PlaitBoard, removeGroups: PlaitGroup[]) => {
    const selectedIsolatedElements = getSelectedIsolatedElements(board);
    selectedIsolatedElements.forEach(item => {
        const groups = getGroupByElement(board, item, true) as PlaitGroup[];
        const elementsInGroup = getElementsInGroup(board, groups[0], false, true);
        const siblingElements = elementsInGroup.filter(element => element.id !== item.id);
        if (siblingElements.length === 1) {
            if (groups.some(group => removeGroups.includes(group))) {
                const group = groups.find(group => !removeGroups.includes(group));
                const path = PlaitBoard.findPath(board, siblingElements[0]);
                Transforms.setNode(board, { groupId: group?.id || undefined }, path);
            }
        }
    });
};
