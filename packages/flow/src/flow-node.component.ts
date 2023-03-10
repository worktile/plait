import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, Renderer2, ViewContainerRef } from '@angular/core';
import { drawRichtext } from '@plait/richtext';
import { PlaitPluginElementComponent, BeforeContextChange, PlaitPluginElementContext, HOST_TO_ROUGH_SVG, createG } from '@plait/core';
import { FlowNode } from './interfaces';
import { RoughSVG } from 'roughjs/bin/svg';
import { SELECTED_FlOW_ELEMENTS } from './plugins/weak-maps';
import { getClientByNode } from './queries/get-client-by-node';
import { drawHandles, drawNode } from './draw/node';

@Component({
    selector: 'plait-flow-node',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlowNodeComponent extends PlaitPluginElementComponent<FlowNode> implements OnInit, BeforeContextChange<FlowNode>, OnDestroy {
    nodeG: SVGGElement | null = null;

    activeNodeG: SVGGElement | null = null;

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

    beforeContextChange(value: PlaitPluginElementContext<FlowNode>) {
        if (value.element !== this.element && this.initialized) {
            this.updateElement(true, value.element);
        }
        if (value.selection !== this.selection && this.initialized) {
            const activeElement = SELECTED_FlOW_ELEMENTS.get(this.board);
            const isActive = activeElement && activeElement[0] === this.element;
            if (isActive) {
                this.drawActiveElement(value.element);
            } else {
                this.destroyActiveElement();
                this.destroyHandles();
            }
        }
    }

    drawElement(element: FlowNode = this.element) {
        this.destroyElement();
        this.nodeG = drawNode(this.roughSVG, element);
        this.g.prepend(this.nodeG);
    }

    drawRichtext(element: FlowNode = this.element) {
        this.destroyRichtext();
        const { x, y, width, height } = getClientByNode(element);
        const richtext = drawRichtext(x, y, width, height, element.data.value, this.viewContainerRef);
        if (richtext) {
            const { richtextG } = richtext;
            this.richtextG = richtextG;
            this.render2.addClass(richtextG, 'flow-node-richtext');
            this.g.append(richtextG);
        }
    }

    drawActiveElement(element: FlowNode = this.element) {
        this.destroyActiveElement();
        this.activeNodeG = drawNode(this.roughSVG, element, { stroke: '#4e8afa', strokeWidth: 2, fill: '' }, true);
        this.g.prepend(this.activeNodeG);
    }

    drawHandles(element: FlowNode = this.element) {
        this.destroyHandles();
        const handles = drawHandles(this.roughSVG, element);
        this.handlesG = createG();
        handles.map(item => {
            this.handlesG?.append(item);
        });
        this.g.append(this.handlesG);
    }

    updateElement(doCheck = false, element: FlowNode = this.element) {
        this.drawElement(element);
        this.drawRichtext(element);
        this.drawHandles(element);
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

    destroyActiveElement() {
        if (this.activeNodeG) {
            this.activeNodeG.remove();
            this.activeNodeG = null;
        }
    }

    destroyRichtext() {
        if (this.richtextG) {
            this.richtextG.remove();
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
