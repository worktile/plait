import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    NgZone,
    OnDestroy,
    OnInit,
    Renderer2,
    ViewContainerRef
} from '@angular/core';
import { PlaitPluginElementComponent, PlaitPluginElementContext, createG, isSelectedElement, RectangleClient } from '@plait/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { drawEdge, drawEdgeMarkers, drawRichtextBackground } from './draw/edge';
import { PlaitBoard, OnContextChanged } from '@plait/core';
import { drawEdgeHandles } from './draw/handle';
import { TextManage } from '@plait/text';
import { getEdgeTextBackgroundRect, getEdgeTextRect, getEdgeTextXYPosition } from './utils/edge/text';
import { FlowEdge } from './interfaces/edge';
import { FlowBaseData } from './interfaces/element';
import { Element, Text } from 'slate';

@Component({
    selector: 'plait-flow-edge',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlowEdgeComponent<T extends FlowBaseData = FlowBaseData> extends PlaitPluginElementComponent<FlowEdge<T>>
    implements OnInit, OnContextChanged<FlowEdge, PlaitBoard>, OnDestroy {
    nodeG: SVGGElement | null = null;

    roughSVG!: RoughSVG;

    handlesG: SVGGElement | null = null;

    richtextBackgroundG?: SVGGElement | null = null;

    sourceMarkerG?: SVGGElement[] | null = null;

    textRect: RectangleClient | null = null;

    textManage!: TextManage;

    constructor(
        public cdr: ChangeDetectorRef,
        public viewContainerRef: ViewContainerRef,
        public render2: Renderer2,
        public ngZone: NgZone
    ) {
        super(cdr);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.textManage = new TextManage(this.board, this.viewContainerRef, () => {
            return getEdgeTextRect(this.board, this.element);
        });
        this.roughSVG = PlaitBoard.getRoughSVG(this.board);
        const isActive = isSelectedElement(this.board, this.element);
        this.drawElement(this.element, isActive);
    }

    onContextChanged(value: PlaitPluginElementContext<FlowEdge, PlaitBoard>, previous: PlaitPluginElementContext<FlowEdge, PlaitBoard>) {
        if (value.element !== previous.element && this.initialized) {
            this.drawElement(value.element, value.selected);
        }
        if (this.initialized) {
            if (value.selected) {
                this.setActiveNodeToTop();
                this.drawElement(value.element, value.selected);
                this.drawHandles();
            } else {
                this.drawElement(value.element);
                this.destroyHandles();
            }
        }
    }

    setActiveNodeToTop() {
        const parentElement = this.g.parentElement;
        this.g.remove();
        parentElement?.append(this.g);
    }

    drawElement(element: FlowEdge = this.element, active = false) {
        this.drawEdge(element, active);
        if (element.data?.text && Element.isElement(element.data.text)) {
            const text = (element.data.text.children[0] as Text).text;
            if (text) {
                this.textRect = getEdgeTextRect(this.board, element);
                this.ngZone.run(() => {
                    this.drawRichtext(element, this.textRect!, active);
                });
            }
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
        this.g.prepend(this.nodeG);
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
            const textBackgroundRect = getEdgeTextBackgroundRect(textRect);
            this.richtextBackgroundG = drawRichtextBackground(this.roughSVG, element, textBackgroundRect!, active);
            this.textManage.draw(element.data.text);
            this.textManage.g.prepend(this.richtextBackgroundG);
            this.textManage.g.classList.add('flow-edge-richtext');
            this.g.append(this.textManage.g);
        }
    }

    updateRichtextPosition(element: FlowEdge<T> = this.element, active = false) {
        if (element.data?.text) {
            const { x, y } = getEdgeTextXYPosition(this.board, this.element, this.textRect!.width, this.textRect!.height);
            const { width, height } = this.textRect!;
            this.textManage.updateRectangle({ x, y, width, height });
            const textBackgroundRect = getEdgeTextBackgroundRect({
                x,
                y,
                width,
                height
            });
            this.destroyRichtextBackgroundG();
            this.richtextBackgroundG = drawRichtextBackground(this.roughSVG, element, textBackgroundRect!, active);
            this.textManage.g.prepend(this.richtextBackgroundG);
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
        this.textManage.destroy();
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
