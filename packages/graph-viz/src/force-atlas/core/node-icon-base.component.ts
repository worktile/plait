import { PlaitBoard } from '@plait/core';
import { ForceAtlasNodeElement } from '../../interfaces/element';
import { DEFAULT_NODE_ICON_COLOR, NODE_ICON_CLASS_NAME, NODE_ICON_FONT_SIZE } from '../constants';
import { NodeIconItem } from '../types';

export abstract class ForceAtlasNodeIconBaseComponent {
    iconItem!: NodeIconItem;

    board!: PlaitBoard;

    element!: ForceAtlasNodeElement;

    abstract nativeElement(): HTMLElement;

    initialize() {
        if (!this.iconItem.fontSize) {
            this.iconItem.fontSize = NODE_ICON_FONT_SIZE;
        }
        if (!this.iconItem.color) {
            this.iconItem.color = DEFAULT_NODE_ICON_COLOR;
        }
        this.nativeElement().style.fontSize = `${this.iconItem.fontSize}px`;
        this.nativeElement().style.color = `${this.iconItem.color}`;
        this.nativeElement().classList.add(NODE_ICON_CLASS_NAME);
    }
}
