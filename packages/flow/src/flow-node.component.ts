import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    OnDestroy,
    OnInit,
    Renderer2,
    ViewContainerRef
} from '@angular/core';
import { PlaitRichtextComponent, drawRichtext } from '@plait/richtext';
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

    richtextG?: SVGGElement;

    richtextComponentRef?: ComponentRef<PlaitRichtextComponent>;

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
            this.updateElement(value.element);
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
        const { richtextG, richtextComponentRef } = drawRichtext(x, y, width, height, element.data.value, this.viewContainerRef);
        this.richtextComponentRef = richtextComponentRef;
        this.richtextG = richtextG;
        this.render2.addClass(this.richtextG, 'flow-node-richtext');
        this.g.append(this.richtextG);
    }

    updateElement(element: FlowNode = this.element) {
        this.drawElement(element);
        this.drawRichtext(element);
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
        if (this.richtextComponentRef) {
            this.richtextComponentRef.destroy();
        }
    }
}
