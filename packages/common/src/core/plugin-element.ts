import { ELEMENT_TO_REF, PlaitBoard, PlaitElement, PlaitPluginElementComponent } from '@plait/core';
import { TextManage } from '@plait/text';
import { ELEMENT_TO_TEXT_MANAGES } from '../utils/text';
import { PlaitCommonElementRef } from './element-ref';
import { Directive } from '@angular/core';

@Directive()
export abstract class CommonPluginElement<
    T extends PlaitElement = PlaitElement,
    K extends PlaitBoard = PlaitBoard,
    R extends PlaitCommonElementRef = PlaitCommonElementRef
> extends PlaitPluginElementComponent<T, K, R> {
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
