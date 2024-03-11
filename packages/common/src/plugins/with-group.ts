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
    getElementsInGroup,
    Selection,
    Point,
    Transforms,
    WritableClipboardContext,
    RectangleClient,
    addClipboardContext,
    createClipboardContext,
    WritableClipboardType,
    idCreator
} from '@plait/core';
import { GroupComponent } from '../core/group.component';

export function withGroup(board: PlaitBoard) {
    let groupRectangleG: SVGGElement | null;

    const { drawElement, pointerMove, globalPointerUp, setFragment, insertFragment } = board;

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

    board.setFragment = (
        data: DataTransfer | null,
        clipboardContext: WritableClipboardContext | null,
        rectangle: RectangleClient | null,
        type: 'copy' | 'cut'
    ) => {
        const groups = getHighestSelectedGroups(board);
        const clipboardGroups: PlaitElement[] = [];
        groups.forEach(item => {
            clipboardGroups.push(item);
            const elementsInGroup = getElementsInGroup(board, item, true, true);
            clipboardGroups.push(...elementsInGroup.filter(item => PlaitGroupElement.isGroup(item)));
        });
        if (!clipboardContext) {
            clipboardContext = createClipboardContext(WritableClipboardType.elements, clipboardGroups, '');
        } else {
            clipboardContext = addClipboardContext(clipboardContext, {
                text: '',
                type: WritableClipboardType.elements,
                data: clipboardGroups
            });
        }
        setFragment(data, clipboardContext, rectangle, type);
    };

    board.insertFragment = (data: DataTransfer | null, clipboardData: ClipboardData | null, targetPoint: Point) => {
        if (clipboardData?.elements?.length) {
            const groups = getHighestSelectedGroups(board, clipboardData?.elements);
            const selectedIsolatedElements = getSelectedIsolatedElements(board, clipboardData?.elements);
            const elements: PlaitElement[] = [];
            selectedIsolatedElements.forEach(item => {
                elements.push(!item.groupId ? item : updateElementsGroupId(item));
            });
            if (groups.length) {
                groups.forEach(item => {
                    const newGroup = { ...updateElementsGroupId(item, undefined), id: idCreator() };
                    elements.push(newGroup);
                    elements.push(...rebuildGroupElements(item, clipboardData.elements!, newGroup.id));
                });
            }
            const groupElements = elements?.filter(value => PlaitGroupElement.isGroup(value)) as PlaitElement[];
            groupElements.forEach(element => {
                Transforms.insertNode(board, element, [board.children.length]);
            });
            clipboardData.elements = elements;
        }
        insertFragment(data, clipboardData, targetPoint);
    };

    return board;
}

const updateElementsGroupId = (element: PlaitElement, groupId?: string) => {
    return {
        ...element,
        groupId: groupId
    };
};

const rebuildGroupElements = (group: PlaitGroup, clipboardDataElements: PlaitElement[], newGroupId: string) => {
    const elements: PlaitElement[] = [];
    const elementsInGroup = clipboardDataElements.filter(item => item.groupId === group.id);
    if (elementsInGroup.length) {
        elementsInGroup.forEach(item => {
            if (PlaitGroupElement.isGroup(item)) {
                const newGroup = { ...updateElementsGroupId(item, newGroupId), id: idCreator() };
                elements.push(newGroup);
                elements.push(...rebuildGroupElements(item, clipboardDataElements, newGroup.id));
            } else {
                elements.push(updateElementsGroupId(item, newGroupId));
            }
        });
    }
    return elements;
};
