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
    WritableClipboardContext,
    RectangleClient,
    addClipboardContext,
    createClipboardContext,
    WritableClipboardType,
    idCreator,
    getSelectedElements,
    getGroupByElement,
    getElementsInGroup
} from '@plait/core';
import { GroupComponent } from '../core/group.component';

export function withGroup(board: PlaitBoard) {
    let groupRectangleG: SVGGElement | null;

    const { drawElement, pointerMove, globalPointerUp, setFragment, insertFragment, getDeletedFragment } = board;

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
        return getSelectedGroups(board, elements);
    };

    board.setFragment = (
        data: DataTransfer | null,
        clipboardContext: WritableClipboardContext | null,
        rectangle: RectangleClient | null,
        type: 'copy' | 'cut'
    ) => {
        const selectedElements = getSelectedElements(board);
        const selectedGroups = board.getRelatedFragment(selectedElements);
        if (!clipboardContext) {
            clipboardContext = createClipboardContext(WritableClipboardType.elements, selectedGroups, '');
        } else {
            clipboardContext = addClipboardContext(clipboardContext, {
                text: '',
                type: WritableClipboardType.elements,
                data: selectedGroups
            });
        }
        setFragment(data, clipboardContext, rectangle, type);
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
        const selectedGroups = getHighestSelectedGroups(board);
        const selectedIsolatedElements = getSelectedIsolatedElements(board);
        const removeNodes = [...selectedGroups, ...selectedIsolatedElements];
        data.push(...selectedGroups);
        removeNodes.forEach(item => {
            const group = getGroupByElement(board, item) as PlaitGroup;
            if (group) {
                const elementsInGroup = getElementsInGroup(board, group, false, true);
                const siblingElements = elementsInGroup.filter(element => element.id !== item.id);
                if (siblingElements.length === 1) {
                    const siblingElement = siblingElements[0];
                    if (PlaitGroupElement.isGroup(siblingElement)) {
                        const elementsInRemoveGroup = getElementsInGroup(board, siblingElement, false, true);
                        elementsInRemoveGroup.forEach(node => {
                            const path = PlaitBoard.findPath(board, node);
                            Transforms.setNode(board, { groupId: siblingElement.groupId || undefined }, path);
                        });
                        data.push(siblingElement);
                    } else {
                        const path = PlaitBoard.findPath(board, siblingElement);
                        Transforms.setNode(board, { groupId: group.groupId || undefined }, path);
                        data.push(group);
                    }
                }
            }
        });
        return getDeletedFragment(data);
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
