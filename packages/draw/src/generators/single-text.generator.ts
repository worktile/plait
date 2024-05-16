import { PlaitBoard, PlaitElement } from '@plait/core';
import { ParagraphElement } from '@plait/text';
import { PlaitCommonGeometry, PlaitGeometry } from '../interfaces';
import { ViewContainerRef } from '@angular/core';
import { PlaitDrawShapeText, TextGenerator, TextGeneratorOptions } from './text.generator';
import { isMultipleTextGeometry } from '../utils';

export class SingleTextGenerator<T extends PlaitElement = PlaitGeometry> extends TextGenerator<T> {
    get textManage() {
        return this.textManages[0];
    }

    constructor(board: PlaitBoard, element: T, text: ParagraphElement, viewContainerRef: ViewContainerRef, options: TextGeneratorOptions) {
        super(board, element, [{ key: element.id, text: text, textHeight: element.textHeight }], viewContainerRef, options);
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
