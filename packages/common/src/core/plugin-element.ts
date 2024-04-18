import { PlaitBoard, PlaitElement, PlaitPluginElementComponent } from '@plait/core';
import { TextManage } from '@plait/text';
import { ELEMENT_TO_TEXT_MANAGES } from '../utils/text';

export abstract class CommonPluginElement<
    T extends PlaitElement = PlaitElement,
    K extends PlaitBoard = PlaitBoard
> extends PlaitPluginElementComponent<T, K> {
    private textManages: TextManage[] = [];

    initializeTextManages(textManages: TextManage[]) {
        this.textManages = textManages;
        this.updateTextManagesMap();
    }

    updateTextManagesMap() {
        ELEMENT_TO_TEXT_MANAGES.set(this.element, this.textManages);
    }

    addTextManage(textManage: TextManage) {
        this.textManages.push(textManage);
    }

    destroyTextManages() {
        this.getTextManages().forEach(manage => {
            manage.destroy();
        });
        this.textManages = [];
        this.updateTextManagesMap();
    }

    getTextManages() {
        return this.textManages;
    }
}
