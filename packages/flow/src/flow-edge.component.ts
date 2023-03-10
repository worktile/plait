import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, Renderer2, ViewContainerRef } from '@angular/core';
import { PlaitPluginElementComponent, BeforeContextChange, PlaitPluginElementContext, HOST_TO_ROUGH_SVG, createG } from '@plait/core';
import { FlowEdge } from './interfaces';
import { RoughSVG } from 'roughjs/bin/svg';
import { drawEdge, drawEdgeHandles, getEdgePoints } from './draw/edge';
import { drawRichtext } from '@plait/richtext';
import { SELECTED_FlOW_ELEMENTS } from './plugins/weak-maps';
import { drawHandles } from './draw/node';

@Component({
    selector: 'plait-flow-edge',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlowEdgeComponent extends PlaitPluginElementComponent<FlowEdge> implements OnInit, BeforeContextChange<FlowEdge>, OnDestroy {
    nodeG: SVGGElement | null = null;

    roughSVG!: RoughSVG;

    foreignObject?: SVGForeignObjectElement;

    richtextG?: SVGGElement;

    handlesG: SVGGElement | null = null;

    constructor(public cdr: ChangeDetectorRef, public viewContainerRef: ViewContainerRef, public render2: Renderer2) {
        super(cdr);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.roughSVG = HOST_TO_ROUGH_SVG.get(this.host) as RoughSVG;
        this.drawElement();
        this.drawRichtext();
    }

    beforeContextChange(value: PlaitPluginElementContext<FlowEdge>) {
        if (value.element !== this.element && this.initialized) {
            this.updateElement(true, value.element);
        }
        if (value.selection !== this.selection && this.initialized) {
            const activeElement = SELECTED_FlOW_ELEMENTS.get(this.board);
            const isActive = activeElement && activeElement[0] === this.element;
            if (isActive) {
                this.drawActiveElement(value.element);
            } else {
                this.drawElement(value.element);
                this.destroyHandles();
            }
        }
    }

    updateFlowEdge(doCheck = false, element: FlowEdge = this.element) {
        this.drawActiveElement(element);
        this.drawRichtext();
        if (doCheck) {
            this.cdr.detectChanges();
        }
    }

    drawElement(element: FlowEdge = this.element) {
        this.destroyElement();
        this.nodeG = drawEdge(this.board, this.roughSVG, element);
        this.g.prepend(this.nodeG);
    }

    drawActiveElement(element: FlowEdge = this.element) {
        this.destroyElement();
        this.nodeG = drawEdge(this.board, this.roughSVG, element, true);
        this.g.prepend(this.nodeG);
        this.drawHandles();
    }

    drawRichtext() {
        this.destroyRichtext();
        const [pathPoints, labelX, labelY, offsetX, offsetY] = getEdgePoints(this.board, this.element);
        const richtext = drawRichtext(labelX, labelY, 50, 50, this.element.data.value, this.viewContainerRef);
        if (richtext) {
            const { richtextG } = richtext;
            this.richtextG = richtextG;
            this.render2.addClass(richtextG, 'flow-edge-label');
            this.g.append(richtextG);
        }
    }

    drawHandles(element: FlowEdge = this.element) {
        this.destroyHandles();
        const handles = drawEdgeHandles(this.board, this.roughSVG, element);
        this.handlesG = createG();
        handles.map(item => {
            this.handlesG?.append(item);
        });
        this.g.append(this.handlesG);
    }

    updateElement(doCheck = false, element: FlowEdge = this.element) {
        this.destroyElement();
        this.drawRichtext();
        if (doCheck) {
            this.cdr.detectChanges();
        }
    }

    destroyRichtext() {
        if (this.richtextG) {
            this.richtextG.remove();
        }
    }

    destroyElement() {
        if (this.nodeG) {
            this.nodeG.remove();
            this.nodeG = null;
        }
    }

    destroyHandles() {
        if (this.handlesG) {
            this.handlesG.remove();
            this.handlesG = null;
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.destroyElement();
        this.destroyRichtext();
    }
}
