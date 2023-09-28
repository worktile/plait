import { PlaitBoard, PlaitElement, Point, RectangleClient, getDataFromClipboard, getSelectedElements, setClipboardData } from '@plait/core';
import { getSelectedDrawElements } from '../utils/selected';
import { PlaitDrawElement, PlaitGeometry, PlaitLine } from '../interfaces';
import { getTextFromClipboard, getTextSize } from '@plait/text';
import { buildClipboardData, insertClipboardData } from '../utils/clipboard';
import { DrawTransforms } from '../transforms';
import { getBoardLines } from '../utils/line';

export const withDrawFragment = (baseBoard: PlaitBoard) => {
    const board = baseBoard as PlaitBoard;
    const { getDeletedFragment, setFragment, insertFragment } = board;

    board.getDeletedFragment = (data: PlaitElement[]) => {
        const drawElements = getSelectedDrawElements(board);
        if (drawElements.length) {
            const geometryElements = drawElements.filter(value => PlaitDrawElement.isGeometry(value)) as PlaitGeometry[];
            const lineElements = drawElements.filter(value => PlaitDrawElement.isLine(value)) as PlaitLine[];
            const boundLineElements = getBoundedLineElements(board, geometryElements).filter(line => !lineElements.includes(line));
            data.push(...[...geometryElements, ...lineElements, ...boundLineElements.filter(line => !lineElements.includes(line))]);
        }
        return getDeletedFragment(data);
    };

    board.setFragment = (data: DataTransfer | null, rectangle: RectangleClient | null, type: 'copy' | 'cut') => {
        const targetDrawElements = getSelectedDrawElements(board);
        let boundLineElements: PlaitLine[] = [];
        if (targetDrawElements.length) {
            if (type === 'cut') {
                const geometryElements = targetDrawElements.filter(value => PlaitDrawElement.isGeometry(value)) as PlaitGeometry[];
                const lineElements = targetDrawElements.filter(value => PlaitDrawElement.isLine(value)) as PlaitLine[];
                boundLineElements = getBoundedLineElements(board, geometryElements).filter(line => !lineElements.includes(line));
            }
            const elements = buildClipboardData(
                board,
                [...targetDrawElements, ...boundLineElements],
                rectangle ? [rectangle.x, rectangle.y] : [0, 0]
            );
            setClipboardData(data, elements);
        }
        setFragment(data, rectangle, type);
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

export const getBoundedLineElements = (board: PlaitBoard, geometries: PlaitGeometry[]) => {
    const lines = getBoardLines(board);
    return lines.filter(line =>
        geometries.find(geometry => PlaitLine.isBoundElementOfSource(line, geometry) || PlaitLine.isBoundElementOfTarget(line, geometry))
    );
};
