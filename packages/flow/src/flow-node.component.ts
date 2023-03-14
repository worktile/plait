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
    getSelectedElements,
    createG
} from '@plait/core';
import { FlowNode } from './interfaces';
import { RoughSVG } from 'roughjs/bin/svg';
import { drawNode } from './draw/node';
import { Element } from 'slate';
import { getClientByNode } from './queries/get-client-by-node';
import { drawHandles } from './draw/handle';
import { getDefaultHandles } from './queries/get-default-handles';

@Component({
    selector: 'plait-flow-node',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlowNodeComponent<T extends Element = Element> extends PlaitPluginElementComponent<FlowNode<T>>
    implements OnInit, BeforeContextChange<FlowNode<T>>, OnDestroy {
    nodeG: SVGGElement | null = null;

    activeNodeG: SVGGElement | null = null;

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
            const selectedElements = getSelectedElements(this.board);
            if (selectedElements.includes(this.element)) {
                this.drawActiveElement(value.element);
                this.drawHandles();
            } else {
                this.destroyActiveElement();
                this.destroyHandles();
            }
        }
    }

    drawElement(element: FlowNode = this.element) {
        this.destroyElement();
        this.nodeG = drawNode(this.roughSVG, element);
        this.g.append(this.nodeG);
    }

    drawActiveElement(element: FlowNode = this.element) {
        this.destroyActiveElement();
        this.activeNodeG = drawNode(this.roughSVG, element, true);
        this.g.prepend(this.activeNodeG);
    }

    drawRichtext(element: FlowNode<T> = this.element) {
        this.destroyRichtext();
        if (element.data?.text) {
            const { x, y, width, height } = getClientByNode(element);
            const { richtextG, richtextComponentRef } = drawRichtext(x, y, width, height, element.data.text, this.viewContainerRef);
            this.richtextComponentRef = richtextComponentRef;
            this.richtextG = richtextG;
            this.render2.addClass(this.richtextG, 'flow-node-richtext');
            this.g.append(this.richtextG);
        }
    }

    drawHandles(element: FlowNode = this.element) {
        this.destroyHandles();
        const handles = drawHandles(this.roughSVG, element.handles || getDefaultHandles(), element);
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
        if (this.richtextComponentRef) {
            this.richtextComponentRef.destroy();
        }
    }
}
