import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    NgZone,
    OnDestroy,
    OnInit,
    Renderer2,
    ViewContainerRef
} from '@angular/core';
import { PlaitPluginElementComponent, PlaitPluginElementContext, createG, isSelectedElement, RectangleClient } from '@plait/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { drawEdge, drawEdgeLabel, drawEdgeMarkers } from './draw/edge';
import { PlaitBoard, OnContextChanged } from '@plait/core';
import { drawEdgeHandles } from './draw/handle';
import { TextManage } from '@plait/text';
import { getEdgeTextXYPosition } from './utils/edge/text';
import { FlowEdge } from './interfaces/edge';
import { FlowBaseData } from './interfaces/element';
import { Element, Text } from 'slate';
import { FlowEdgeLabelIconDrawer } from './draw/label-icon';
import { PlaitFlowBoard } from './interfaces';
import { EdgeLabelSpace } from './utils';

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

    labelG?: SVGGElement | null = null;

    sourceMarkerG?: SVGGElement[] | null = null;

    textRect: RectangleClient | null = null;

    textManage!: TextManage;

    labelIconDrawer!: FlowEdgeLabelIconDrawer;

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
            return EdgeLabelSpace.getLabelTextRect(this.board, this.element);
        });
        this.roughSVG = PlaitBoard.getRoughSVG(this.board);
        const isActive = isSelectedElement(this.board, this.element);
        this.labelIconDrawer = new FlowEdgeLabelIconDrawer(this.board as PlaitFlowBoard, this.viewContainerRef);
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
                this.textRect = EdgeLabelSpace.getLabelTextRect(this.board, element);
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
        this.nodeG.setAttribute('stroke-linecap', 'round');
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
            this.handlesG?.setAttribute('stroke-linecap', 'round');
            this.g.append(this.handlesG);
        }
    }

    drawRichtext(element: FlowEdge = this.element, textRect: RectangleClient, active = false) {
        this.destroyRichtext();
        if (element.data?.text && textRect) {
            const labelRect = EdgeLabelSpace.getLabelRect(textRect, element);
            this.labelG = drawEdgeLabel(this.roughSVG, element, labelRect!, active);
            this.textManage.draw(element.data.text);
            this.textManage.g.prepend(this.labelG);
            this.textManage.g.classList.add('flow-edge-richtext');
            const iconG = this.labelIconDrawer.drawLabelIcon(this.element);
            iconG && this.textManage.g.append(iconG);
            this.g.append(this.textManage.g);
        }
    }

    updateRichtextPosition(element: FlowEdge<T> = this.element, active = false) {
        if (element.data?.text) {
            const { x, y } = getEdgeTextXYPosition(this.board, this.element, this.textRect!.width, this.textRect!.height);
            const { width, height } = this.textRect!;
            this.textManage.updateRectangle({ x, y, width, height });
            const labelRect = EdgeLabelSpace.getLabelRect(
                {
                    x,
                    y,
                    width,
                    height
                },
                element
            );
            this.destroyLabelG();
            this.labelG = drawEdgeLabel(this.roughSVG, element, labelRect!, active);
            this.textManage.g.prepend(this.labelG);
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
        this.destroyLabelG();
    }

    destroyLabelG() {
        if (this.labelG) {
            this.labelG.remove();
            this.labelG = null;
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
