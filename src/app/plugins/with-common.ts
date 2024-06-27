import { PlaitBoard, PlaitElement, RectangleClient } from '@plait/core';
import { getElementArea, ImageProps, PlaitImageBoard, TRANSPARENT } from '@plait/common';
import { AngularBoard } from '@plait/angular-board';
import { PlaitImageComponent } from '../editor/image/image.component';
import {
    DefaultDrawStyle,
    getFillByElement as getDrawFillByElement,
    PlaitDrawElement,
    PlaitGeometry,
    PlaitShapeElement
} from '@plait/draw';
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
    console.log(elements);
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        let fill = '';
        if (PlaitDrawElement.isGeometry(element) && !PlaitDrawElement.isText(element)) {
            fill = getDrawFillByElement(board, element);
            console.log(1, fill);
        }
        if (MindElement.isMindElement(board, element)) {
            console.log(2, fill);
            fill = getMindFillByElement(board, element);
        }
        if (fill && fill !== DefaultDrawStyle.fill && fill !== TRANSPARENT) {
            firstFilledElement = element;
            filledElementIndex = i;
            break;
        }
    }
    const endIndex = firstFilledElement ? filledElementIndex + 1 : elements.length;
    const newElements = elements.slice(0, endIndex);
    const texts = newElements.filter(item => PlaitDrawElement.isText(item));
    if (texts.length) {
        return texts[0];
    }
    const lines = newElements.filter(item => PlaitDrawElement.isLine(item));
    if (lines.length) {
        return lines[0];
    }
    const shapeElements = newElements.filter(item => !(PlaitDrawElement.isLine(item) && PlaitDrawElement.isText(item))) as PlaitElement[];
    const sortElements = shapeElements.sort((a, b) => {
        return getElementArea(board, a) - getElementArea(board, b);
    });
    return sortElements[0];
};
