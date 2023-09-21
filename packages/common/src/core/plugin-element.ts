import { PlaitBoard, PlaitElement, PlaitPluginElementComponent } from '@plait/core';
import { TextManage } from '@plait/text';

export abstract class CommonPluginElement<
    T extends PlaitElement = PlaitElement,
    K extends PlaitBoard = PlaitBoard
> extends PlaitPluginElementComponent<T, K> {
    textManages: TextManage[] = [];

    initializeTextManages() {}
}
