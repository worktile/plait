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
    getGroupByElement,
    getSelectedIsolatedElementsCanAddToGroup,
    getElementsInGroup,
    getRectangleByGroup,
    PlaitPointerType,
    WritableClipboardOperationType,
    throttleRAF,
    isMovingElements
} from '@plait/core';
import { GroupComponent } from '../core/group.component';
import { isKeyHotkey } from 'is-hotkey';
import { isResizing } from '../utils';

export function withGroup(board: PlaitBoard) {
    let groupRectangleG: SVGGElement | null;
    let removeGroups: PlaitGroup[] | null;

    const {
        drawElement,
        pointerMove,
        globalPointerUp,
        insertFragment,
        getDeletedFragment,
        deleteFragment,
        getRelatedFragment,
        getRectangle,
        keyDown
    } = board;

    board.drawElement = (context: PlaitPluginElementContext) => {
        if (PlaitGroupElement.isGroup(context.element)) {
            return GroupComponent;
        }
        return drawElement(context);
    };

    board.pointerMove = (event: PointerEvent) => {
        throttleRAF(board, 'with-group', () => {
            groupRectangleG?.remove();
            const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            let selection: Selection = { anchor: point, focus: point };
            if (board.selection && !Selection.isCollapsed(board.selection)) {
                selection = board.selection;
            }
            const pointer = PlaitBoard.getPointer(board);
            if (!isResizing(board) && !isMovingElements(board) && pointer === PlaitPointerType.selection) {
                const hitElements = getHitElementsBySelection(board, selection);
                if (hitElements.length) {
                    groupRectangleG = createGroupRectangleG(board, hitElements);
                    groupRectangleG && PlaitBoard.getElementActiveHost(board).append(groupRectangleG);
                }
            }
        });
        pointerMove(event);
    };

    board.globalPointerUp = (event: PointerEvent) => {
        groupRectangleG?.remove();
        groupRectangleG = null;
        globalPointerUp(event);
    };

    board.getRelatedFragment = (elements: PlaitElement[], originData?: PlaitElement[]) => {
        const groups = getSelectedGroups(board, elements, originData);
        return getRelatedFragment([...elements, ...groups], originData);
    };

    board.insertFragment = (clipboardData: ClipboardData | null, targetPoint: Point, operationType?: WritableClipboardOperationType) => {
        let elements: PlaitElement[] = [];
        if (clipboardData?.elements?.length) {
            elements = new Array(clipboardData?.elements?.length);
            const groups = getHighestSelectedGroups(board, clipboardData?.elements);
            const selectedIsolatedElements = getSelectedIsolatedElements(board, clipboardData?.elements);
            selectedIsolatedElements.forEach(item => {
                const index = clipboardData.elements!.map(element => element.id).indexOf(item.id);
                elements.splice(index, 1, !item.groupId ? item : updateGroupId(item, undefined));
            });
            if (groups.length) {
                groups.forEach(item => {
                    const index = clipboardData.elements!.map(element => element.id).indexOf(item.id);
                    const newGroup = { ...updateGroupId(item, undefined), id: idCreator() };
                    elements.splice(index, 1, newGroup);
                    updateElementsGroupId(item, clipboardData.elements!, newGroup.id, elements);
                });
            }
            clipboardData.elements = elements;
        }
        insertFragment(clipboardData, targetPoint, operationType);
        const groupElements = elements?.filter(value => PlaitGroupElement.isGroup(value)) as PlaitElement[];
        groupElements.forEach(element => {
            Transforms.insertNode(board, element, [board.children.length]);
        });
    };

    board.getDeletedFragment = (data: PlaitElement[]) => {
        removeGroups = getRemoveGroups(board);
        if (removeGroups && removeGroups.length) {
            data.push(...removeGroups);
        }
        return getDeletedFragment(data);
    };

    board.deleteFragment = (elements: PlaitElement[]) => {
        if (removeGroups?.length) {
            updateSiblingElementGroupId(board, removeGroups);
        }
        deleteFragment(elements);
        removeGroups = null;
    };

    board.getRectangle = (element: PlaitElement) => {
        if (PlaitGroupElement.isGroup(element)) {
            return getRectangleByGroup(board, element, true);
        }
        return getRectangle(element);
    };

    board.keyDown = (event: KeyboardEvent) => {
        if (!PlaitBoard.isReadonly(board)) {
            if (isKeyHotkey('mod+g', event)) {
                event.preventDefault();
                Transforms.addGroup(board);
                return;
            }
            if (isKeyHotkey('mod+shift+g', event)) {
                event.preventDefault();
                Transforms.removeGroup(board);
                return;
            }
        }
        keyDown(event);
    };

    return board;
}

const updateGroupId = (element: PlaitElement, groupId?: string) => {
    return {
        ...element,
        groupId: groupId
    };
};

const updateElementsGroupId = (group: PlaitGroup, clipboardDataElements: PlaitElement[], newGroupId: string, elements: PlaitElement[]) => {
    const elementsInGroup = clipboardDataElements.filter(item => item.groupId === group.id);
    if (elementsInGroup.length) {
        elementsInGroup.forEach(item => {
            const index = clipboardDataElements.map(item => item.id).indexOf(item.id);
            if (PlaitGroupElement.isGroup(item)) {
                const newGroup = { ...updateGroupId(item, newGroupId), id: idCreator() };
                elements.splice(index, 1, newGroup);
                updateElementsGroupId(item, clipboardDataElements, newGroup.id, elements);
            } else {
                elements.splice(index, 1, updateGroupId(item, newGroupId));
            }
        });
    }
    return elements;
};

const getRemoveGroups = (board: PlaitBoard) => {
    const selectedGroups = board.getRelatedFragment([]) as PlaitGroup[];
    const removeGroups = [...selectedGroups];
    const highestSelectedGroups = getHighestSelectedGroups(board);
    const selectedIsolatedElements = getSelectedIsolatedElementsCanAddToGroup(board);
    const removeNodes = [...highestSelectedGroups, ...selectedIsolatedElements];
    removeNodes.forEach(item => {
        const hitElementGroups = getGroupByElement(board, item, true) as PlaitGroup[];
        if (hitElementGroups.length) {
            const elementsInGroup = getElementsInGroup(board, hitElementGroups[0], false, true);
            const siblingElements = elementsInGroup.filter(
                element => ![...removeNodes, ...removeGroups].map(item => item.id).includes(element.id)
            );
            if (siblingElements.length === 1 || siblingElements.length === 0) {
                if (!removeGroups.includes(hitElementGroups[0])) {
                    removeGroups.push(hitElementGroups[0]);
                }
                if (siblingElements.length === 1) {
                    if (hitElementGroups.length > 1) {
                        const aboveGroup = findAboveGroupWithAnotherElement(board, hitElementGroups.slice(1, hitElementGroups.length), [
                            ...removeNodes,
                            ...removeGroups
                        ]);
                        let index = hitElementGroups.length;
                        if (aboveGroup) {
                            index = hitElementGroups.findIndex(item => item.id === aboveGroup.id);
                        }
                        [...hitElementGroups.slice(1, index)].forEach(item => {
                            if (!removeGroups.includes(item)) {
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

const findAboveGroupWithAnotherElement = (board: PlaitBoard, groups: PlaitGroup[], excludeNodes: PlaitElement[]) => {
    let group: PlaitGroup | null = null;
    for (let i = 0; i < groups.length; i++) {
        const elementsInGroup = getElementsInGroup(board, groups[i], false, true);
        const siblingElements = elementsInGroup.filter(element => !excludeNodes.map(item => item.id).includes(element.id));
        if (siblingElements.length > 0) {
            group = groups[i];
            break;
        }
    }
    return group;
};

const updateSiblingElementGroupId = (board: PlaitBoard, removeGroups: PlaitGroup[]) => {
    const selectedIsolatedElements = getSelectedIsolatedElementsCanAddToGroup(board);
    const highestSelectedGroups = getHighestSelectedGroups(board);
    const isolatedElementsInGroup = selectedIsolatedElements.filter(item => item.groupId);
    [...highestSelectedGroups, ...isolatedElementsInGroup].forEach(item => {
        const hitElementGroups = getGroupByElement(board, item, true) as PlaitGroup[];
        if (hitElementGroups.length) {
            const elementsInGroup = getElementsInGroup(board, hitElementGroups[0], false, true);
            const siblingElements = elementsInGroup.filter(element => element.id !== item.id);
            if (siblingElements.length === 1) {
                const removeGroupIds = removeGroups.map(item => item.id);
                if (hitElementGroups.some(group => removeGroupIds.includes(group.id))) {
                    const group = hitElementGroups.find(group => !removeGroupIds.includes(group.id));
                    const path = PlaitBoard.findPath(board, siblingElements[0]);
                    Transforms.setNode(board, { groupId: group?.id || undefined }, path);
                }
            }
        }
    });
};
