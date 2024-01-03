import {
    PlaitBoard,
    PlaitElement,
    Point,
    RectangleClient,
    getSelectedElements,
    setPlaitClipboardData
} from '@plait/core';
import { getSelectedDrawElements } from '../utils/selected';
import { PlaitDrawElement, PlaitGeometry, PlaitLine, PlaitShape } from '../interfaces';
import { DrawTransforms } from '../transforms';
import { getBoardLines } from '../utils/line';
import { PlaitImage } from '../interfaces/image';
import { acceptImageTypes, buildImage, getElementOfFocusedImage } from '@plait/common';
import { DEFAULT_IMAGE_WIDTH } from '../constants';
import { buildClipboardData, insertClipboardData } from '../utils/clipboard';
import { getPlaitClipboardData } from 'packages/core/src/utils';

export const withDrawFragment = (baseBoard: PlaitBoard) => {
    const board = baseBoard as PlaitBoard;
    const { getDeletedFragment, setFragment, insertFragment } = board;

    board.getDeletedFragment = (data: PlaitElement[]) => {
        const drawElements = getSelectedDrawElements(board);
        if (drawElements.length) {
            const geometryElements = drawElements.filter(value => PlaitDrawElement.isGeometry(value)) as PlaitGeometry[];
            const lineElements = drawElements.filter(value => PlaitDrawElement.isLine(value)) as PlaitLine[];
            const imageElements = drawElements.filter(value => PlaitDrawElement.isImage(value)) as PlaitImage[];

            const boundLineElements = [
                ...getBoundedLineElements(board, geometryElements),
                ...getBoundedLineElements(board, imageElements)
            ].filter(line => !lineElements.includes(line));
            data.push(
                ...[
                    ...geometryElements,
                    ...lineElements,
                    ...imageElements,
                    ...boundLineElements.filter(line => !lineElements.includes(line))
                ]
            );
        }
        return getDeletedFragment(data);
    };

    board.setFragment = async (data: DataTransfer | null, rectangle: RectangleClient | null, type: 'copy' | 'cut') => {
        const targetDrawElements = getSelectedDrawElements(board) as PlaitDrawElement[];
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
            const texts = elements.map(item => item.text?.children?.length && item.text.children[0].text);
            await setPlaitClipboardData(data, elements, texts.join(' '));
        }
        setFragment(data, rectangle, type);
    };

    board.insertFragment = async (clipboardData: DataTransfer | null, targetPoint: Point) => {
        const pasteData = await getPlaitClipboardData(clipboardData);
        if (!pasteData || !pasteData?.value.length) {
            return;
        }
        if (pasteData.type === 'plait') {
            const elements = pasteData.value as PlaitElement[];
            const drawElements = elements.filter(value => PlaitDrawElement.isDrawElement(value)) as PlaitDrawElement[];
            if (drawElements.length) {
                insertClipboardData(board, drawElements, targetPoint);
            }
        }
        if (pasteData.type === 'text') {
            const selectedElements = getSelectedElements(board);
            const insertAsChildren = selectedElements.length === 1 && selectedElements[0].children;
            const insertAsFreeText = !insertAsChildren;
            if (pasteData.value && insertAsFreeText) {
                DrawTransforms.insertText(board, targetPoint, pasteData.value);
                return;
            }
        }
        if (pasteData.type === 'file') {
            const selectedElements = getSelectedElements(board);
            const canInsertionImage =
                !getElementOfFocusedImage(board) && !(selectedElements.length === 1 && board.isImageBindingAllowed(selectedElements[0]));
            const acceptImageArray = acceptImageTypes.map(type => 'image/' + type);
            if (canInsertionImage) {
                const imageFile = await pasteData.value[0];
                if (acceptImageArray.includes(imageFile.type)) {
                    buildImage(board, imageFile, DEFAULT_IMAGE_WIDTH, imageItem => {
                        DrawTransforms.insertImage(board, imageItem, targetPoint);
                    });
                    return;
                }
            }
        }

        insertFragment(clipboardData, targetPoint);
    };

    return board;
};

export const getBoundedLineElements = (board: PlaitBoard, plaitShapes: PlaitShape[]) => {
    const lines = getBoardLines(board);
    return lines.filter(line =>
        plaitShapes.find(shape => PlaitLine.isBoundElementOfSource(line, shape) || PlaitLine.isBoundElementOfTarget(line, shape))
    );
};
