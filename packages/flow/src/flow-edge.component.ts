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
export class FlowEdgeComponent extends PlaitPluginElementComponent<FlowEdge> implements OnInit, BeforeContextChange<FlowEdge>, OnDestroy {
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

    beforeContextChange(value: PlaitPluginElementContext<FlowEdge>) {
        if (value.element !== this.element && this.initialized) {
            this.updateElement(true, value.element);
        }
    }

    drawElement(element: FlowEdge = this.element) {
        this.destroyElement();
        this.nodeG = drawEdge(this.board, this.roughSVG, this.element);
        this.g.append(this.nodeG);
    }

    updateElement(doCheck = false, element: FlowEdge = this.element) {
        this.drawElement(element);
        if (doCheck) {
            this.cdr.detectChanges();
        }
    }

    destroyElement() {
        if (this.nodeG) {
            this.nodeG.remove();
            this.nodeG = null;
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.destroyElement();
    }
}
