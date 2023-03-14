import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import {
    PlaitPluginElementComponent,
    BeforeContextChange,
    PlaitPluginElementContext,
    BOARD_TO_SELECTED_ELEMENT,
    createG
} from '@plait/core';
import { FlowEdge } from './interfaces';
import { RoughSVG } from 'roughjs/bin/svg';
import { drawEdge } from './draw/edge';
import { PlaitBoard } from '@plait/core';
import { drawEdgeHandles } from './draw/handle';

@Component({
    selector: 'plait-flow-edge',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlowEdgeComponent<T = string> extends PlaitPluginElementComponent<FlowEdge<T>>
    implements OnInit, BeforeContextChange<FlowEdge<T>>, OnDestroy {
    nodeG: SVGGElement | null = null;

    roughSVG!: RoughSVG;

    handlesG: SVGGElement | null = null;

    constructor(public cdr: ChangeDetectorRef) {
        super(cdr);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.roughSVG = PlaitBoard.getRoughSVG(this.board);
        this.drawElement();
    }

    beforeContextChange(value: PlaitPluginElementContext<FlowEdge<T>>) {
        if (value.element !== this.element && this.initialized) {
            this.drawElement(value.element);
        }
        if (value.selection !== this.selection && this.initialized) {
            const activeElement = BOARD_TO_SELECTED_ELEMENT.get(this.board);
            const isActive = activeElement && activeElement[0] === this.element;
            this.drawElement(value.element, isActive);
            if (isActive) {
                this.drawHandles();
            } else {
                this.destroyHandles();
            }
        }
    }

    drawElement(element: FlowEdge<T> = this.element, active = false) {
        this.destroyElement();
        this.nodeG = drawEdge(this.board, this.roughSVG, element, active);
        this.g.append(this.nodeG);
    }

    drawHandles() {
        this.destroyHandles();
        const handles = drawEdgeHandles(this.board, this.roughSVG, this.element);
        this.handlesG = createG();
        handles.map(item => {
            this.handlesG?.append(item);
        });
        this.g.append(this.handlesG);
    }

    destroyHandles() {
        if (this.handlesG) {
            this.handlesG.remove();
            this.handlesG = null;
        }
    }

    destroyElement() {
        if (this.nodeG) {
            this.nodeG.remove();
            this.nodeG = null;
        }
    }
}
