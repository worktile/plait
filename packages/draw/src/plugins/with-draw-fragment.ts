import {
    ClipboardData,
    PlaitBoard,
    PlaitElement,
    Point,
    RectangleClient,
    WritableClipboardContext,
    WritableClipboardType,
    addClipboardContext,
    createClipboardContext,
    getSelectedElements
} from '@plait/core';
import { getSelectedDrawElements } from '../utils/selected';
import { PlaitDrawElement, PlaitGeometry, PlaitLine, PlaitShape } from '../interfaces';
import { buildClipboardData, insertClipboardData } from '../utils/clipboard';
import { DrawTransforms } from '../transforms';
import { getBoardLines } from '../utils/line/line-basic';
import { PlaitImage } from '../interfaces/image';
import { acceptImageTypes, buildImage, getElementOfFocusedImage, getElementsText, getFirstTextEditor } from '@plait/common';
import { DEFAULT_IMAGE_WIDTH } from '../constants';

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

    board.setFragment = (
        data: DataTransfer | null,
        clipboardContext: WritableClipboardContext | null,
        rectangle: RectangleClient | null,
        type: 'copy' | 'cut'
    ) => {
        const targetDrawElements = getSelectedDrawElements(board);
        let boundLineElements: PlaitLine[] = [];
        if (targetDrawElements.length) {
            if (type === 'cut') {
                const geometryElements = targetDrawElements.filter(value => PlaitDrawElement.isGeometry(value)) as PlaitGeometry[];
                const lineElements = targetDrawElements.filter(value => PlaitDrawElement.isLine(value)) as PlaitLine[];
                boundLineElements = getBoundedLineElements(board, geometryElements).filter(line => !lineElements.includes(line));
            }
            const selectedElements = [...targetDrawElements, ...boundLineElements];
            const elements = buildClipboardData(board, selectedElements, rectangle ? [rectangle.x, rectangle.y] : [0, 0]);
            const text = getElementsText(selectedElements);
            if (!clipboardContext) {
                clipboardContext = createClipboardContext(WritableClipboardType.elements, elements, text);
            } else {
                clipboardContext = addClipboardContext(clipboardContext, {
                    text,
                    type: WritableClipboardType.elements,
                    data: elements
                });
            }
        }
        setFragment(data, clipboardContext, rectangle, type);
    };

    board.insertFragment = (data: DataTransfer | null, clipboardData: ClipboardData | null, targetPoint: Point) => {
        const selectedElements = getSelectedElements(board);

        if (clipboardData?.files?.length) {
            const acceptImageArray = acceptImageTypes.map(type => 'image/' + type);
            const canInsertionImage =
                !getElementOfFocusedImage(board) && !(selectedElements.length === 1 && board.isImageBindingAllowed(selectedElements[0]));
            if (acceptImageArray.includes(clipboardData.files[0].type) && canInsertionImage) {
                const imageFile = clipboardData.files[0];
                buildImage(board, imageFile, DEFAULT_IMAGE_WIDTH, imageItem => {
                    DrawTransforms.insertImage(board, imageItem, targetPoint);
                });
                return;
            }
        }

        if (clipboardData?.elements?.length) {
            const drawElements = clipboardData.elements?.filter(value => PlaitDrawElement.isDrawElement(value)) as PlaitDrawElement[];
            if (clipboardData.elements && clipboardData.elements.length > 0 && drawElements.length > 0) {
                insertClipboardData(board, drawElements, targetPoint);
            }
        }

        if (clipboardData?.text) {
            if (!clipboardData.elements || clipboardData.elements.length === 0) {
                // (*￣︶￣)
                const insertAsChildren = selectedElements.length === 1 && selectedElements[0].children;
                const insertAsFreeText = !insertAsChildren;
                if (insertAsFreeText) {
                    DrawTransforms.insertText(board, targetPoint, clipboardData.text);
                    return;
                }
            }
        }

        insertFragment(data, clipboardData, targetPoint);
    };

    return board;
};

export const getBoundedLineElements = (board: PlaitBoard, plaitShapes: PlaitShape[]) => {
    const lines = getBoardLines(board);
    return lines.filter(line =>
        plaitShapes.find(shape => PlaitLine.isBoundElementOfSource(line, shape) || PlaitLine.isBoundElementOfTarget(line, shape))
    );
};
