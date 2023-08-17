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
import { FlowEdge } from './interfaces/edge';
import { FlowBaseData } from './interfaces/element';
import { Element, Text } from 'slate';
import { FlowEdgeLabelIconDrawer } from './draw/label-icon';
import { PlaitFlowBoard } from './interfaces';
import { EdgeLabelSpace } from './utils';
import { FlowRenderMode } from './interfaces/flow';

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

    markersG?: SVGGElement[] | null = null;

    textManage?: TextManage;

    labelIconDrawer!: FlowEdgeLabelIconDrawer;

    activeG: SVGGElement | null = null;

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

        this.textManage =
            this.element.data?.text &&
            new TextManage(this.board, this.viewContainerRef, {
                getRectangle: () => {
                    return EdgeLabelSpace.getLabelTextRect(this.board, this.element);
                }
            });

        this.roughSVG = PlaitBoard.getRoughSVG(this.board);
        this.labelIconDrawer = new FlowEdgeLabelIconDrawer(this.board as PlaitFlowBoard, this.viewContainerRef, this.cdr);
        this.drawElement(this.element, isSelectedElement(this.board, this.element) ? FlowRenderMode.active : FlowRenderMode.default);
    }

    onContextChanged(value: PlaitPluginElementContext<FlowEdge, PlaitBoard>, previous: PlaitPluginElementContext<FlowEdge, PlaitBoard>) {
        if (this.initialized && (value.element !== previous.element || value.selected !== previous.selected)) {
            this.drawElement(value.element, value.selected ? FlowRenderMode.active : FlowRenderMode.default);
        }
    }

    drawElement(element: FlowEdge = this.element, mode: FlowRenderMode = FlowRenderMode.default) {
        // 处理节点高亮当前为 selected 不绘制
        if (this.selected && mode !== FlowRenderMode.active) {
            return;
        }
        this.drawEdge(element, mode);
        this.drawLabel(element, mode);
        this.drawMarkers(element, mode);
        this.drawHandles(element, mode);

        if (mode === FlowRenderMode.default) {
            this.g.prepend(this.nodeG!);
            this.markersG!.map(arrowLine => {
                this.g.append(arrowLine);
            });
            this.labelG && PlaitBoard.getElementUpperHost(this.board).append(this.labelG);
            this.activeG && this.activeG.remove();
        } else {
            this.activeG = this.activeG || createG();
            this.activeG?.prepend(this.nodeG!);
            this.labelG && this.activeG?.append(this.labelG);
            this.markersG!.map(arrowLine => {
                this.activeG?.append(arrowLine);
            });
            this.activeG?.append(this.handlesG!);
            PlaitBoard.getElementActiveHost(this.board).append(this.activeG!);
        }
    }

    drawLabel(element: FlowEdge = this.element, mode: FlowRenderMode = FlowRenderMode.default) {
        this.destroyLabelG();
        if (element.data?.text && Element.isElement(element.data.text)) {
            if ((element.data.text.children[0] as Text)?.text) {
                this.ngZone.run(() => {
                    this.labelG = createG();
                    const textRect = EdgeLabelSpace.getLabelTextRect(this.board, element);
                    const labelRect = EdgeLabelSpace.getLabelRect(textRect, element);
                    const labelRectangle = drawEdgeLabel(this.roughSVG, element, labelRect!, mode);
                    this.labelG?.prepend(labelRectangle);

                    this.textManage?.draw(element.data?.text!);
                    this.textManage?.g.classList.add('flow-edge-richtext');
                    this.labelG?.append(this.textManage?.g!);

                    const labelIcon = this.labelIconDrawer.drawLabelIcon(textRect, this.element);
                    labelIcon && this.labelG?.append(labelIcon);
                });
            }
        }
    }

    drawEdge(element: FlowEdge = this.element, mode: FlowRenderMode) {
        this.destroyEdge();
        this.nodeG = drawEdge(this.board, this.roughSVG, element, mode);
        this.nodeG.setAttribute('stroke-linecap', 'round');
    }

    drawHandles(element: FlowEdge = this.element, mode: FlowRenderMode) {
        this.destroyHandles();
        if (mode === FlowRenderMode.active) {
            const handles = drawEdgeHandles(this.board, this.roughSVG, element);
            this.handlesG = createG();
            handles.forEach(item => {
                this.handlesG?.append(item);
                this.render2.addClass(item, 'flow-handle');
            });
            this.handlesG?.setAttribute('stroke-linecap', 'round');
        }
    }

    drawMarkers(element: FlowEdge = this.element, mode: FlowRenderMode) {
        if (element.target.marker || element.source?.marker) {
            this.destroyMarkers();
            this.markersG = drawEdgeMarkers(this.board, this.roughSVG, element, mode);
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

    destroyLabelG() {
        if (this.labelG) {
            this.labelG.remove();
            this.textManage?.destroy();
            this.labelIconDrawer.destroy();
            this.labelG = null;
        }
    }

    destroyMarkers() {
        if (this.markersG) {
            this.markersG.forEach(item => {
                item.remove();
            });
            this.markersG = null;
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.destroyLabelG();
        this.destroyMarkers();
        this.destroyEdge();
        this.destroyHandles();
        this.activeG?.remove();
        this.activeG = null;
    }
}
