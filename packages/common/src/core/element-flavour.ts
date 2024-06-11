import { ElementFlavour, PlaitBoard, PlaitElement } from '@plait/core';
import { ELEMENT_TO_TEXT_MANAGES } from '../utils/text';
import { PlaitCommonElementRef } from './element-ref';
import { TextManage } from '../text/text-manage';

export class CommonElementFlavour<
    T extends PlaitElement = PlaitElement,
    K extends PlaitBoard = PlaitBoard,
    R extends PlaitCommonElementRef = PlaitCommonElementRef
> extends ElementFlavour<T, K, R> {
    private textManages: TextManage[] = [];

    constructor(elementRef = new PlaitCommonElementRef()) {
        super(elementRef as R);
    }

    initializeWeakMap() {
        ELEMENT_TO_TEXT_MANAGES.set(this.element, this.textManages);
    }

    destroyWeakMap() {
        ELEMENT_TO_TEXT_MANAGES.delete(this.element);
    }

    initializeTextManages(textManages: TextManage[]) {
        this.textManages = textManages;
        this.initializeWeakMap();
    }

    addTextManage(textManage: TextManage) {
        this.textManages.push(textManage);
    }

    destroyTextManages() {
        this.getTextManages().forEach(manage => {
            manage.destroy();
        });
        this.textManages = [];
        this.destroyWeakMap();
    }

    getTextManages() {
        return this.textManages;
    }
}
