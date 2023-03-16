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
import {
    PlaitPluginElementComponent,
    BeforeContextChange,
    PlaitPluginElementContext,
    PlaitBoard,
    normalizePoint,
    createG,
    isSelectedElement
} from '@plait/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { Element } from 'slate';
import { drawNodeHandles } from './draw/handle';
import { drawActiveMask, drawNode } from './draw/node';
import { FlowNode } from './interfaces/node';

@Component({
    selector: 'plait-flow-node',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlowNodeComponent<T extends Element = Element> extends PlaitPluginElementComponent<FlowNode<T>>
    implements OnInit, BeforeContextChange<FlowNode<T>>, OnDestroy {
    nodeG: SVGGElement | null = null;

    activeMaskG: SVGGElement | null = null;

    roughSVG!: RoughSVG;

    richtextG?: SVGGElement;

    richtextComponentRef?: ComponentRef<PlaitRichtextComponent>;

    handlesG: SVGGElement | null = null;

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
        if (value.selection !== this.selection && this.initialized) {
            if (isSelectedElement(this.board, value.element)) {
                this.drawActiveMask(value.element);
                this.drawHandles();
            } else {
                this.destroyActiveMask();
                this.destroyHandles();
            }
        }
    }

    drawElement(element: FlowNode = this.element) {
        this.destroyElement();
        this.nodeG = drawNode(this.roughSVG, element);
        this.g.append(this.nodeG);
    }

    drawActiveMask(element: FlowNode = this.element) {
        this.destroyActiveMask();
        this.activeMaskG = drawActiveMask(this.roughSVG, element);
        this.g.prepend(this.activeMaskG);
    }

    drawRichtext(element: FlowNode<T> = this.element) {
        this.destroyRichtext();
        if (element.data?.text) {
            const { x, y } = normalizePoint(element.points![0]);
            const { richtextG, richtextComponentRef } = drawRichtext(
                x,
                y,
                element.width,
                element.height,
                element.data.text,
                this.viewContainerRef
            );
            this.richtextComponentRef = richtextComponentRef;
            this.richtextG = richtextG;
            this.render2.addClass(this.richtextG, 'flow-node-richtext');
            this.g.append(this.richtextG);
        }
    }

    drawHandles(element: FlowNode = this.element) {
        this.destroyHandles();
        const handles = drawNodeHandles(this.roughSVG, element);
        this.handlesG = createG();
        handles.map(item => {
            this.handlesG?.append(item);
        });
        this.g.append(this.handlesG);
    }

    updateElement(element: FlowNode<T> = this.element) {
        this.drawElement(element);
        this.drawRichtext(element);
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

    destroyActiveMask() {
        if (this.activeMaskG) {
            this.activeMaskG.remove();
            this.activeMaskG = null;
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
