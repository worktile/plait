import { PlaitBoard } from '@plait/core';
import { LabelIconItem } from '../interfaces/icon';
import { FlowElement } from '../interfaces/element';
import { EDGE_LABEL_FONTSIZE } from '../constants/edge';

export abstract class FlowEdgeLabelIconBaseComponent {
    fontSize: number = EDGE_LABEL_FONTSIZE;

    iconItem!: LabelIconItem;

    board!: PlaitBoard;

    element!: FlowElement;

    abstract nativeElement(): HTMLElement;

    initialize() {
        this.nativeElement().style.fontSize = `${this.fontSize}px`;
        this.nativeElement().classList.add('flow-edge-label-icon');
    }
}
