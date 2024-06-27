import { PlaitBoard, PlaitElement } from '@plait/core';
import { ImageProps, isFilled, PlaitImageBoard, sortElementsByArea } from '@plait/common';
import { AngularBoard } from '@plait/angular-board';
import { PlaitImageComponent } from '../editor/image/image.component';
import { getFillByElement as getDrawFillByElement, getFirstTextOrLineElement, PlaitDrawElement } from '@plait/draw';
import { MindElement } from 'packages/mind/src/interfaces';
import { getFillByElement as getMindFillByElement } from '@plait/mind';

export const withCommonPlugin = (board: PlaitBoard) => {
    const newBoard = board as PlaitBoard & PlaitImageBoard & AngularBoard;

    const { getHitElement } = newBoard;

    newBoard.renderImage = (container: Element | DocumentFragment, props: ImageProps) => {
        const { ref } = newBoard.renderComponent(PlaitImageComponent, container, props);
        return ref;
    };

    newBoard.getHitElement = (elements: PlaitElement[]) => {
        const hasMindElements = elements.some(item => MindElement.isMindElement(board, item));
        const hasDrawElements = elements.some(item => PlaitDrawElement.isDrawElement(item));
        if (hasMindElements && hasDrawElements) {
            return getCommonHitElement(board, elements);
        }
        return getHitElement(elements);
    };

    return board;
};

export const getCommonHitElement = (board: PlaitBoard, elements: PlaitElement[]) => {
    let firstFilledElement: PlaitElement | null = null;
    let filledElementIndex = -1;
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        let fill = '';
        if (PlaitDrawElement.isGeometry(element) && !PlaitDrawElement.isText(element)) {
            fill = getDrawFillByElement(board, element);
        }
        if (MindElement.isMindElement(board, element)) {
            fill = getMindFillByElement(board, element);
        }
        if (isFilled(fill)) {
            firstFilledElement = element;
            filledElementIndex = i;
            break;
        }
    }
    const endIndex = firstFilledElement ? filledElementIndex + 1 : elements.length;
    const newElements = elements.slice(0, endIndex);
    const element = getFirstTextOrLineElement(newElements as PlaitDrawElement[]);
    if (element) {
        return element;
    }
    const sortElements = sortElementsByArea(board, newElements, 'asc');
    return sortElements[0];
};
