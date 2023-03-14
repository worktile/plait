import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { PlaitPluginElementComponent, BeforeContextChange, PlaitPluginElementContext, HOST_TO_ROUGH_SVG } from '@plait/core';
import { FlowEdge } from './interfaces';
import { RoughSVG } from 'roughjs/bin/svg';
import { drawEdge } from './draw/edge';

@Component({
    selector: 'plait-flow-edge',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlowEdgeComponent<T = string> extends PlaitPluginElementComponent<FlowEdge<T>>
    implements OnInit, BeforeContextChange<FlowEdge<T>>, OnDestroy {
    nodeG: SVGGElement | null = null;

    roughSVG!: RoughSVG;

    constructor(public cdr: ChangeDetectorRef) {
        super(cdr);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.roughSVG = HOST_TO_ROUGH_SVG.get(this.host) as RoughSVG;
        this.drawElement();
    }

    beforeContextChange(value: PlaitPluginElementContext<FlowEdge<T>>) {
        if (value.element !== this.element && this.initialized) {
            this.drawElement(value.element);
        }
    }

    drawElement(element: FlowEdge<T> = this.element) {
        this.destroyElement();
        this.nodeG = drawEdge(this.board, this.roughSVG, element);
        this.g.append(this.nodeG);
    }

    destroyElement() {
        if (this.nodeG) {
            this.nodeG.remove();
            this.nodeG = null;
        }
    }
}
