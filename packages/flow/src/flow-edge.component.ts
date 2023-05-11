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
    RectangleClient
} from '@plait/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { drawEdge, drawEdgeMarkers, drawRichtextBackground } from './draw/edge';
import { PlaitBoard } from '@plait/core';
import { drawEdgeHandles } from './draw/handle';
import { PlaitRichtextComponent, drawRichtext, updateForeignObject } from '@plait/richtext';
import { Element } from 'slate';
import { getEdgeTextBackgroundRect, getEdgeTextRect, getEdgeTextXYPosition } from './utils/edge/text';
import { FlowEdge } from './interfaces/edge';
import { FlowBaseData } from './interfaces/element';

@Component({
    selector: 'plait-flow-edge',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlowEdgeComponent<T extends FlowBaseData = FlowBaseData> extends PlaitPluginElementComponent<FlowEdge<T>>
    implements OnInit, BeforeContextChange<FlowEdge<T>>, OnDestroy {
    nodeG: SVGGElement | null = null;

    roughSVG!: RoughSVG;

    handlesG: SVGGElement | null = null;

    richtextG?: SVGGElement | null = null;

    richtextBackgroundG?: SVGGElement | null = null;

    richtextComponentRef?: ComponentRef<PlaitRichtextComponent>;

    sourceMarkerG?: SVGGElement[] | null = null;

    textRect: RectangleClient | null = null;

    perviousStatus: 'active' | 'default' = 'default';

    constructor(public cdr: ChangeDetectorRef, public viewContainerRef: ViewContainerRef, public render2: Renderer2) {
        super(cdr);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.roughSVG = PlaitBoard.getRoughSVG(this.board);
        const isActive = isSelectedElement(this.board, this.element);
        this.drawElement(this.element, isActive);
        this.perviousStatus = isActive ? 'active' : 'default';
    }

    beforeContextChange(value: PlaitPluginElementContext<FlowEdge<T>>) {
        const isActive = isSelectedElement(this.board, value.element);
        if (value.element !== this.element && this.initialized) {
            this.drawElement(value.element, isActive);
        }
        if (this.initialized) {
            if (isActive) {
                this.drawElement(value.element, isActive);
                this.drawHandles();
            }
            if (this.perviousStatus === 'active' && !isActive) {
                this.drawElement(value.element);
                this.destroyHandles();
            }
            this.perviousStatus = isActive ? 'active' : 'default';
        }
    }

    drawElement(element: FlowEdge = this.element, active = false) {
        this.drawEdge(element, active);
        if (element.data?.text) {
            this.textRect = getEdgeTextRect(this.board, element);
            this.drawRichtext(element, this.textRect!, active);
        }
        this.drawMarkers(element, active);
        this.drawHandles(element, active);
    }

    updateElement(element: FlowEdge<T> = this.element, active = false) {
        this.drawEdge(element, active);
        this.updateRichtextPosition(element, active);
        this.drawMarkers(element, active);
        this.drawHandles(element, active);
    }

    drawEdge(element: FlowEdge = this.element, active = false) {
        this.destroyEdge();
        this.nodeG = drawEdge(this.board, this.roughSVG, element, active);
        if (this.nodeG) {
            this.g.prepend(this.nodeG);
        }
    }

    drawHandles(element: FlowEdge = this.element, active = false) {
        if (active) {
            this.destroyHandles();
            const handles = drawEdgeHandles(this.board, this.roughSVG, element);
            this.handlesG = createG();
            handles.map(item => {
                this.handlesG?.append(item);
                this.render2.addClass(item, 'flow-handle');
            });
            this.g.append(this.handlesG);
        }
    }

    drawRichtext(element: FlowEdge = this.element, textRect: RectangleClient, active = false) {
        this.destroyRichtext();
        if (element.data?.text && textRect) {
            const { x, y, width, height } = textRect!;
            const textBackgroundRect = getEdgeTextBackgroundRect(textRect);
            this.richtextBackgroundG = drawRichtextBackground(this.roughSVG, element, textBackgroundRect!, active);
            const { richtextG, richtextComponentRef } = drawRichtext(x, y, width, height, element.data.text, this.viewContainerRef);
            this.richtextComponentRef = richtextComponentRef;
            this.richtextG = createG();
            this.richtextG.append(this.richtextBackgroundG);
            this.richtextG.append(richtextG);
            this.render2.addClass(this.richtextG, 'flow-edge-richtext');
            this.g.append(this.richtextG);
        }
    }

    updateRichtextPosition(element: FlowEdge<T> = this.element, active = false) {
        if (element.data?.text && this.richtextG) {
            const edgeTextXYPosition = getEdgeTextXYPosition(this.board, this.element, this.textRect!.width, this.textRect!.height);
            if (edgeTextXYPosition) {
                const { x, y } = edgeTextXYPosition;
                const { width, height } = this.textRect!;
                updateForeignObject(this.richtextG!, width, height, x, y);
                const textBackgroundRect = getEdgeTextBackgroundRect({
                    x,
                    y,
                    width,
                    height
                });
                this.destroyRichtextBackgroundG();
                this.richtextBackgroundG = drawRichtextBackground(this.roughSVG, element, textBackgroundRect!, active);
                this.richtextG?.prepend(this.richtextBackgroundG);
            }
        }
    }

    drawMarkers(element: FlowEdge = this.element, active = false) {
        if (element.target.marker || element.source?.marker) {
            this.destroyMarkers();
            this.sourceMarkerG = drawEdgeMarkers(this.board, this.roughSVG, element, active);
            this.sourceMarkerG!.map(arrowline => {
                this.g.append(arrowline);
            });
        }
    }

    destroyHandles() {
        if (this.handlesG) {
            this.handlesG.remove();
            this.handlesG = null;
        }
    }

    destroyEdge() {
        if (this.nodeG) {
            this.nodeG.remove();
            this.nodeG = null;
        }
    }

    destroyRichtext() {
        if (this.richtextG) {
            this.richtextG.remove();
            this.richtextG = null;
        }
        if (this.richtextComponentRef) {
            this.richtextComponentRef.destroy();
        }
        this.destroyRichtextBackgroundG();
    }

    destroyRichtextBackgroundG() {
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
            this.sourceMarkerG = null;
        }
    }
}
