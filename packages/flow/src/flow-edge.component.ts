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
import { FlowEdge, FlowEdgeType, FlowEdgeTypeMode, isActiveEdge } from './interfaces/edge';
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

    elementG!: SVGGElement;

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
        this.elementG = createG();
        const isActive = isSelectedElement(this.board, this.element);
        this.labelIconDrawer = new FlowEdgeLabelIconDrawer(this.board as PlaitFlowBoard, this.viewContainerRef);
        this.drawElement(this.element, isActive ? FlowEdgeType.active : FlowEdgeType.default);
    }

    onContextChanged(value: PlaitPluginElementContext<FlowEdge, PlaitBoard>, previous: PlaitPluginElementContext<FlowEdge, PlaitBoard>) {
        if (value.element !== previous.element && this.initialized) {
            this.drawElement(value.element, value.selected ? FlowEdgeType.active : FlowEdgeType.default);
        }
        if (this.initialized) {
            if (value.selected) {
                this.drawActiveElement(value.element, FlowEdgeType.active);
                this.drawHandles(value.element, FlowEdgeType.active);
            } else if (previous.selected) {
                this.drawElement(value.element);
                this.destroyHandles();
            }
        }
    }

    drawElement(element: FlowEdge = this.element, edgeType: FlowEdgeTypeMode = FlowEdgeType.default) {
        this.drawElementG(element, edgeType);
        this.g.prepend(this.elementG!);
    }

    drawActiveElement(element: FlowEdge = this.element, edgeType: FlowEdgeTypeMode = FlowEdgeType.hover) {
        this.drawElementG(element, edgeType);
        const hostActiveG = PlaitBoard.getElementHostActive(this.board);
        hostActiveG.prepend(this.elementG!);
        if (element.data?.text) {
            hostActiveG.append(this.textManage.g);
        }
    }

    drawElementG(element: FlowEdge = this.element, edgeType: FlowEdgeTypeMode) {
        this.drawEdge(element, edgeType);
        if (element.data?.text && Element.isElement(element.data.text)) {
            const text = (element.data.text.children[0] as Text).text;
            if (text) {
                this.textRect = EdgeLabelSpace.getLabelTextRect(this.board, element);
                this.ngZone.run(() => {
                    this.drawRichtext(element, this.textRect!, edgeType);
                });
            }
        }
        this.drawMarkers(element, edgeType);
        this.drawHandles(element, edgeType);
    }

    updateElement(element: FlowEdge<T> = this.element, edgeType: FlowEdgeTypeMode) {
        this.drawEdge(element, edgeType);
        this.updateRichtextPosition(element, edgeType);
        this.drawMarkers(element, edgeType);
        this.drawHandles(element, edgeType);
    }

    drawEdge(element: FlowEdge = this.element, edgeType: FlowEdgeTypeMode) {
        this.destroyEdge();
        this.nodeG = drawEdge(this.board, this.roughSVG, element, edgeType);
        this.nodeG.setAttribute('stroke-linecap', 'round');
        this.elementG.prepend(this.nodeG);
    }

    drawHandles(element: FlowEdge = this.element, edgeType: FlowEdgeTypeMode) {
        if (isActiveEdge(edgeType)) {
            this.destroyHandles();
            const handles = drawEdgeHandles(this.board, this.roughSVG, element);
            this.handlesG = createG();
            handles.forEach(item => {
                this.handlesG?.append(item);
                this.render2.addClass(item, 'flow-handle');
            });
            this.handlesG?.setAttribute('stroke-linecap', 'round');
            this.elementG.append(this.handlesG);
        }
    }

    drawRichtext(element: FlowEdge = this.element, textRect: RectangleClient, edgeType: FlowEdgeTypeMode) {
        this.destroyRichtext();
        if (element.data?.text && textRect) {
            const labelRect = EdgeLabelSpace.getLabelRect(textRect, element);
            this.labelG = drawEdgeLabel(this.roughSVG, element, labelRect!, edgeType);
            this.textManage.draw(element.data.text);
            this.textManage.g.prepend(this.labelG);
            this.textManage.g.classList.add('flow-edge-richtext');
            const iconG = this.labelIconDrawer.drawLabelIcon(this.element);
            iconG && this.textManage.g.append(iconG);
            PlaitBoard.getElementHostUp(this.board).append(this.textManage.g);
        }
    }

    updateRichtextPosition(element: FlowEdge<T> = this.element, edgeType: FlowEdgeTypeMode) {
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
            this.labelG = drawEdgeLabel(this.roughSVG, element, labelRect!, edgeType);
            this.textManage.g.prepend(this.labelG);
        }
    }

    drawMarkers(element: FlowEdge = this.element, edgeType: FlowEdgeTypeMode) {
        if (element.target.marker || element.source?.marker) {
            this.destroyMarkers();
            this.sourceMarkerG = drawEdgeMarkers(this.board, this.roughSVG, element, edgeType);
            this.sourceMarkerG!.map(arrowline => {
                this.elementG.append(arrowline);
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
            this.sourceMarkerG.forEach(item => {
                item.remove();
            });
            this.sourceMarkerG = null;
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
