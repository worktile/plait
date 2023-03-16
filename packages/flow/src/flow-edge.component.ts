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
import {
    PlaitPluginElementComponent,
    BeforeContextChange,
    PlaitPluginElementContext,
    createG,
    isSelectedElement,
    drawArrow
} from '@plait/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { drawEdge, drawEdgeMarkers, drawRichtextBackground } from './draw/edge';
import { PlaitBoard } from '@plait/core';
import { drawEdgeHandles } from './draw/handle';
import { FlowEdge } from './interfaces/edge';
import { PlaitRichtextComponent, drawRichtext } from '@plait/richtext';
import { Element } from 'slate';
import { getEdgeTextBackgroundRect, getEdgeTextRect } from './utils/edge/text';

@Component({
    selector: 'plait-flow-edge',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlowEdgeComponent<T extends Element = Element> extends PlaitPluginElementComponent<FlowEdge<T>>
    implements OnInit, BeforeContextChange<FlowEdge<T>>, OnDestroy {
    nodeG: SVGGElement | null = null;

    roughSVG!: RoughSVG;

    handlesG: SVGGElement | null = null;

    richtextG?: SVGGElement | null = null;

    richtextBackgroundG?: SVGGElement | null = null;

    richtextComponentRef?: ComponentRef<PlaitRichtextComponent>;

    sourceMarkerG?: SVGGElement[] | null = null;

    constructor(public cdr: ChangeDetectorRef, public viewContainerRef: ViewContainerRef, public render2: Renderer2) {
        super(cdr);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.roughSVG = PlaitBoard.getRoughSVG(this.board);
        this.drawElement();
        this.drawRichtext();
        this.drawMarkers();
    }

    beforeContextChange(value: PlaitPluginElementContext<FlowEdge<T>>) {
        if (value.element !== this.element && this.initialized) {
            this.drawElement(value.element);
        }
        if (value.selection !== this.selection && this.initialized) {
            const isActive = isSelectedElement(this.board, value.element);
            this.drawElement(value.element, isActive);
            this.drawRichtext(value.element, isActive);
            this.drawMarkers(value.element, isActive);
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

    drawRichtext(element: FlowEdge<T> = this.element, active = false) {
        this.destroyRichtext();
        if (element.data?.text) {
            const textRect = getEdgeTextRect(this.board, this.element);
            const textBackgroundRect = getEdgeTextBackgroundRect(textRect);
            const { x, y, width, height } = textRect;
            this.richtextBackgroundG = drawRichtextBackground(this.roughSVG, element, textBackgroundRect, active);
            const { richtextG, richtextComponentRef } = drawRichtext(x, y, width, height, element.data.text, this.viewContainerRef);
            this.richtextComponentRef = richtextComponentRef;
            this.richtextG = createG();
            this.richtextG.append(this.richtextBackgroundG);
            this.richtextG.append(richtextG);
            this.render2.addClass(this.richtextG, 'flow-edge-richtext');
            this.g.append(this.richtextG);
        }
    }

    drawMarkers(element: FlowEdge<T> = this.element, active = false) {
        this.destroyMarkers();
        this.sourceMarkerG = drawEdgeMarkers(this.roughSVG, this.board, element, active);
        this.sourceMarkerG!.map(arrowline => {
            this.g.append(arrowline);
        });
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

    destroyRichtext() {
        if (this.richtextG) {
            this.richtextG.remove();
            this.richtextBackgroundG = null;
        }
        if (this.richtextComponentRef) {
            this.richtextComponentRef.destroy();
        }
        if (this.richtextBackgroundG) {
            this.richtextBackgroundG.remove();
            this.richtextBackgroundG = null;
        }
    }

    destroyMarkers() {
        if (this.sourceMarkerG) {
            this.sourceMarkerG.map(item => {
                item.remove();
            });
            this.richtextBackgroundG = null;
        }
    }
}
