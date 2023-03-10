import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, Renderer2, ViewContainerRef } from '@angular/core';
import { drawRichtext } from '@plait/richtext';
import { PlaitPluginElementComponent, BeforeContextChange, PlaitPluginElementContext, HOST_TO_ROUGH_SVG } from '@plait/core';
import { FlowNode } from './interfaces';
import { RoughSVG } from 'roughjs/bin/svg';
import { drawRectangleNode } from './draw/node';
import { getRectangleByNode } from './utils/get-rectangle-by-node';

@Component({
    selector: 'plait-flow-node',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlowNodeComponent extends PlaitPluginElementComponent<FlowNode> implements OnInit, BeforeContextChange<FlowNode>, OnDestroy {
    nodeG: SVGGElement | null = null;

    roughSVG!: RoughSVG;

    foreignObject?: SVGForeignObjectElement;

    richtextG?: SVGGElement;

    constructor(public cdr: ChangeDetectorRef, public viewContainerRef: ViewContainerRef, public render2: Renderer2) {
        super(cdr);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.roughSVG = HOST_TO_ROUGH_SVG.get(this.host) as RoughSVG;
        this.drawElement();
        this.drawRichtext();
    }

    beforeContextChange(value: PlaitPluginElementContext<FlowNode>) {
        if (value.element !== this.element && this.initialized) {
            this.updateElement(true, value.element);
        }
    }

    drawElement(element: FlowNode = this.element) {
        this.destroyElement();
        this.nodeG = drawRectangleNode(this.roughSVG, element);
        this.g.append(this.nodeG);
    }

    drawRichtext(element: FlowNode = this.element) {
        this.destroyRichtext();
        const { x, y, width, height } = getRectangleByNode(element);
        const richtext = drawRichtext(x, y, width, height, element.data.value, this.viewContainerRef);
        if (richtext) {
            const { richtextG } = richtext;
            this.richtextG = richtextG;
            this.render2.addClass(richtextG, 'flow-node-richtext');
            this.g.append(richtextG);
        }
    }

    updateElement(doCheck = false, element: FlowNode = this.element) {
        this.drawElement(element);
        this.drawRichtext(element);
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

    destroyRichtext() {
        if (this.richtextG) {
            this.richtextG.remove();
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.destroyElement();
        this.destroyRichtext();
    }
}
