import { PlaitBoard, PlaitElement } from '@plait/core';
import { PlaitCommonGeometry, PlaitGeometry } from '../interfaces';
import { PlaitDrawShapeText, TextGenerator, TextGeneratorOptions } from './text.generator';
import { isMultipleTextGeometry } from '../utils';
import { ParagraphElement } from '@plait/common';

export class SingleTextGenerator<T extends PlaitElement = PlaitGeometry> extends TextGenerator<T> {
    get textManage() {
        return this.textManages[0];
    }

    constructor(
        board: PlaitBoard,
        element: T,
        text: ParagraphElement,
        options: TextGeneratorOptions<T>
    ) {
        super(board, element, [{ key: element.id, text: text, textHeight: element.textHeight }], options);
    }

    update(
        element: T,
        previousDrawShapeTexts: PlaitDrawShapeText[],
        currentDrawShapeTexts: PlaitDrawShapeText[],
        elementG: SVGElement
    ): void;
    update(element: T, previousText: ParagraphElement, currentText: ParagraphElement, elementG: SVGElement): void;
    update(
        element: T,
        previousText: ParagraphElement | PlaitDrawShapeText[],
        currentText: ParagraphElement | PlaitDrawShapeText[],
        elementG: SVGElement
    ) {
        if (!isMultipleTextGeometry((element as unknown) as PlaitCommonGeometry)) {
            super.update(
                element,
                [{ text: previousText as ParagraphElement, key: element.id, textHeight: element.textHeight }],
                [{ text: currentText as ParagraphElement, key: element.id, textHeight: element.textHeight }],
                elementG
            );
        }
    }
}
