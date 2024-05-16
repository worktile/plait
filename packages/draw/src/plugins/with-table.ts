import { TableComponent } from '../table.component';
import { PlaitTableElement } from '../interfaces/table';
import {
    PlaitBoard,
    PlaitPluginElementContext,
    PlaitElement,
    RectangleClient,
    Selection,
    isPolylineHitRectangle,
    getSelectedElements,
    toViewBoxPoint,
    toHostPoint,
    getHitElementByPoint,
    getMovingElements,
    isMovingElements,
    InsertNodeOperation
} from '@plait/core';
import { editCell, getHitCell, getRelatedElementsInTable, setElementsTableId } from '../utils/table';
import { PlaitDrawElement } from '../interfaces';

export const withTable = (board: PlaitBoard) => {
    const {
        drawElement,
        getRectangle,
        isRectangleHit,
        isHit,
        isMovable,
        getDeletedFragment,
        dblClick,
        getRelatedFragment,
        onChange,
        pointerMove
    } = board;
    board.drawElement = (context: PlaitPluginElementContext) => {
        if (PlaitTableElement.isTable(context.element)) {
            return TableComponent;
        }
        return drawElement(context);
    };

    board.getDeletedFragment = (data: PlaitElement[]) => {
        const elements = getSelectedElements(board);
        if (elements.length) {
            const tableElements = elements.filter(value => PlaitTableElement.isTable(value));
            data.push(...[...tableElements]);
        }
        return getDeletedFragment(data);
    };

    board.isHit = (element, point) => {
        if (PlaitTableElement.isTable(element)) {
            const client = RectangleClient.getRectangleByPoints(element.points);
            return RectangleClient.isPointInRectangle(client, point);
        }
        return isHit(element, point);
    };

    board.getRectangle = (element: PlaitElement) => {
        if (PlaitTableElement.isTable(element)) {
            return RectangleClient.getRectangleByPoints(element.points);
        }
        return getRectangle(element);
    };

    board.isMovable = (element: PlaitElement) => {
        if (PlaitTableElement.isTable(element)) {
            return true;
        }

        return isMovable(element);
    };

    board.getRelatedFragment = (elements: PlaitElement[], originData?: PlaitElement[]) => {
        const selectedElements = originData?.length ? originData : getSelectedElements(board);
        const elementsInTable = getRelatedElementsInTable(board, selectedElements);
        return getRelatedFragment([...elements, ...elementsInTable], originData);
    };

    board.isRectangleHit = (element: PlaitElement, selection: Selection) => {
        if (PlaitTableElement.isTable(element)) {
            const rangeRectangle = RectangleClient.getRectangleByPoints([selection.anchor, selection.focus]);
            return isPolylineHitRectangle(element.points, rangeRectangle);
        }
        return isRectangleHit(element, selection);
    };

    board.dblClick = (event: MouseEvent) => {
        event.preventDefault();
        if (!PlaitBoard.isReadonly(board)) {
            const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            const hitElement = getHitElementByPoint(board, point);
            if (hitElement && PlaitTableElement.isTable(hitElement)) {
                const hitCell = getHitCell(hitElement, point);
                if (hitCell && hitCell.text && hitCell.textHeight) {
                    editCell(hitCell);
                }
            }
        }
        dblClick(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        pointerMove(event);
        if (isMovingElements(board)) {
            const movingDrawElements = getMovingElements(board).filter(item => PlaitDrawElement.isDrawElement(item)) as PlaitDrawElement[];
            setElementsTableId(board, movingDrawElements);
        }
    };

    board.onChange = () => {
        onChange();
        const insertNodes = board.operations
            .filter(op => op.type === 'insert_node' && PlaitDrawElement.isDrawElement(op.node))
            .map(item => (item as InsertNodeOperation).node) as PlaitDrawElement[];
        setElementsTableId(board, insertNodes);
    };

    return board;
};
