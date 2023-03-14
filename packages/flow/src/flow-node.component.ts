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
import { PlaitPluginElementComponent, BeforeContextChange, PlaitPluginElementContext, PlaitBoard } from '@plait/core';
import { FlowNode } from './interfaces';
import { RoughSVG } from 'roughjs/bin/svg';
import { drawRectangleNode } from './draw/node';
import { getRectangleByNode } from './utils/get-rectangle-by-node';
import { Element } from 'slate';

@Component({
    selector: 'plait-flow-node',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlowNodeComponent<T extends Element = Element> extends PlaitPluginElementComponent<FlowNode<T>>
    implements OnInit, BeforeContextChange<FlowNode<T>>, OnDestroy {
    nodeG: SVGGElement | null = null;

    roughSVG!: RoughSVG;

    richtextG?: SVGGElement;

    richtextComponentRef?: ComponentRef<PlaitRichtextComponent>;

    constructor(public cdr: ChangeDetectorRef, public viewContainerRef: ViewContainerRef, public render2: Renderer2) {
        super(cdr);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.roughSVG = PlaitBoard.getRoughSVG(this.board);
        this.drawElement();
        this.drawRichtext();
    }

    beforeContextChange(value: PlaitPluginElementContext<FlowNode<T>>) {
        if (value.element !== this.element && this.initialized) {
            this.updateElement(value.element);
        }
    }

    drawElement(element: FlowNode = this.element) {
        this.destroyElement();
        this.nodeG = drawRectangleNode(this.roughSVG, element);
        this.g.append(this.nodeG);
    }

    drawRichtext(element: FlowNode<T> = this.element) {
        this.destroyRichtext();
        if (element.data?.text) {
            const { x, y, width, height } = getRectangleByNode(element);
            const { richtextG, richtextComponentRef } = drawRichtext(x, y, width, height, element.data.text, this.viewContainerRef);
            this.richtextComponentRef = richtextComponentRef;
            this.richtextG = richtextG;
            this.render2.addClass(this.richtextG, 'flow-node-richtext');
            this.g.append(this.richtextG);
        }
    }

    updateElement(element: FlowNode<T> = this.element) {
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
