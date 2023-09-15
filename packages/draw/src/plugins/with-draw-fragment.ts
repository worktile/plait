import { PlaitBoard, Point, RectangleClient, getDataFromClipboard, getSelectedElements, setClipboardData } from '@plait/core';
import { getSelectedDrawElements } from '../utils/selected';
import { PlaitDrawElement, PlaitGeometry, PlaitLine } from '../interfaces';
import { CommonTransforms } from '@plait/common';
import { getTextFromClipboard, getTextSize } from '@plait/text';
import { buildClipboardData, insertClipboardData } from '../utils/clipboard';
import { DrawTransforms } from '../transforms';
import { getBoardLines } from '../utils/line';

export const withDrawFragment = (baseBoard: PlaitBoard) => {
    const board = baseBoard as PlaitBoard;
    const { deleteFragment, setFragment, insertFragment } = board;

    board.deleteFragment = (data: DataTransfer | null) => {
        const drawElements = getSelectedDrawElements(board);
        if (drawElements.length) {
            const lines = getBoardLines(board);
            const geometryElements = drawElements.filter(value => PlaitDrawElement.isGeometry(value)) as PlaitGeometry[];
            const lineElements = drawElements.filter(value => PlaitDrawElement.isLine(value)) as PlaitLine[];

            const boundLineElements = lines.filter(line =>
                geometryElements.find(
                    geometry => PlaitLine.isBoundElementOfSource(line, geometry) || PlaitLine.isBoundElementOfTarget(line, geometry)
                )
            );

            CommonTransforms.removeElements(board, [
                ...geometryElements,
                ...lineElements,
                ...boundLineElements.filter(line => !lineElements.includes(line))
            ]);
        }
        deleteFragment(data);
    };

    board.setFragment = (data: DataTransfer | null, rectangle: RectangleClient | null) => {
        const targetDrawElements = getSelectedDrawElements(board);
        if (targetDrawElements.length) {
            const elements = buildClipboardData(board, targetDrawElements, rectangle ? [rectangle.x, rectangle.y] : [0, 0]);
            setClipboardData(data, elements);
        }
        setFragment(data, rectangle);
    };

    board.insertFragment = (data: DataTransfer | null, targetPoint: Point) => {
        const elements = getDataFromClipboard(data);
        const drawElements = elements.filter(value => PlaitDrawElement.isDrawElement(value)) as PlaitDrawElement[];
        if (elements.length > 0 && drawElements.length > 0) {
            insertClipboardData(board, drawElements, targetPoint);
        } else if (elements.length === 0) {
            const text = getTextFromClipboard(data);
            const selectedElements = getSelectedElements(board);
            // (*￣︶￣)
            const insertAsChildren = selectedElements.length === 1 && selectedElements[0].children;
            const insertAsFreeText = !insertAsChildren;
            if (text && insertAsFreeText) {
                const { width, height } = getTextSize(board, text);
                DrawTransforms.insertText(board, [targetPoint, [targetPoint[0] + width, targetPoint[1] + height]], text);
                return;
            }
        }
        insertFragment(data, targetPoint);
    };

    return board;
};
