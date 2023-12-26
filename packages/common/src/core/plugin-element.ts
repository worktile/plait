import { PlaitBoard, PlaitElement, PlaitPluginElementComponent } from '@plait/core';
import { TextManage } from '@plait/text';

export abstract class CommonPluginElement<
    T extends PlaitElement = PlaitElement,
    K extends PlaitBoard = PlaitBoard
> extends PlaitPluginElementComponent<T, K> {
    private textManages: TextManage[] = [];

    initializeTextManages(textManages: TextManage[]) {
        this.textManages = textManages;
    }

    addTextManage(textManage: TextManage) {
        this.textManages.push(textManage);
    }

    destroyTextManages() {
        this.getTextManages().forEach(manage => {
            manage.destroy();
        });
        this.textManages = [];
    }

    getTextManages() {
        return this.textManages;
    }
}
