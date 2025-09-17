import { PlaitBoard, PlaitElement } from '@plait/core';
import { PlaitCommonGeometry, PlaitGeometry } from '../interfaces';
import { DrawTextInfo, TextGenerator, TextGeneratorOptions } from './text.generator';
import { isMultipleTextGeometry } from '../utils';
import { ParagraphElement } from '@plait/common';

export class SingleTextGenerator<T extends PlaitElement = PlaitGeometry> extends TextGenerator<T> {
    get textManage() {
        return this.textManages[0];
    }

    constructor(board: PlaitBoard, element: T, text: ParagraphElement, options: TextGeneratorOptions<T>) {
        super(board, element, [{ id: element.id, text: text }], options);
    }

    update(element: T, previousDrawShapeTexts: DrawTextInfo[], currentDrawShapeTexts: DrawTextInfo[], elementG: SVGElement): void;
    update(element: T, previousText: ParagraphElement, currentText: ParagraphElement, elementG: SVGElement): void;
    update(
        element: T,
        previousText: ParagraphElement | DrawTextInfo[],
        currentText: ParagraphElement | DrawTextInfo[],
        elementG: SVGElement
    ) {
        if (!isMultipleTextGeometry((element as unknown) as PlaitCommonGeometry)) {
            super.update(
                element,
                [{ text: previousText as ParagraphElement, id: element.id }],
                [{ text: currentText as ParagraphElement, id: element.id }],
                elementG
            );
        }
    }
}
