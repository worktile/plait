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
import { PlaitRichtextComponent, drawRichtext } from '@plait/richtext';
import { Element } from 'slate';
import { getEdgeTextBackgroundRect, getEdgeTextRect, getEdgeTextXYPosition } from './utils/edge/text';
import { FlowEdge, FlowEdgeHandleType } from './interfaces/edge';

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

    textRect: RectangleClient | null = null;

    perviousStatus: 'active' | 'default' = 'default';

    constructor(public cdr: ChangeDetectorRef, public viewContainerRef: ViewContainerRef, public render2: Renderer2) {
        super(cdr);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.roughSVG = PlaitBoard.getRoughSVG(this.board);
        this.drawElement();
    }

    beforeContextChange(value: PlaitPluginElementContext<FlowEdge<T>>) {
        // 判断是否选中这里使用 this.element
        // 因为在 beforeContextChange 执行时，选中节点数据并没有更新
        const isActive = isSelectedElement(this.board, this.element);
        if (value.element !== this.element && this.initialized) {
            this.drawElement(value.element, isActive);
        }
        if (value.selection !== this.selection && this.initialized) {
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

    drawElement(element: FlowEdge<T> = this.element, active = false) {
        this.drawEdge(element, active);
        if (element.data?.text) {
            this.textRect = getEdgeTextRect(this.board, element);
            this.drawRichtext(element, this.textRect!, active);
        }
        this.drawMarkers(element, active);
        active && this.drawHandles(element);
    }

    drawDraggingElement(
        element: FlowEdge<T> = this.element,
        active = true,
        offsetX = 0,
        offsetY = 0,
        edgeHandle: FlowEdgeHandleType | null
    ) {
        this.drawEdge(element, active, offsetX, offsetY, edgeHandle);
        // text
        this.destroyRichtext();
        if (element.data?.text && this.textRect) {
            const textXYPosition = getEdgeTextXYPosition(
                this.board,
                this.element,
                offsetX,
                offsetY,
                this.textRect.width,
                this.textRect.height,
                edgeHandle
            );
            this.drawRichtext(
                element,
                {
                    x: textXYPosition.x,
                    y: textXYPosition.y,
                    width: this.textRect.width,
                    height: this.textRect.height
                },
                true
            );
        }
        this.drawMarkers(element, active, offsetX, offsetY, edgeHandle);
        this.drawHandles(element, offsetX, offsetY, edgeHandle);
    }

    drawEdge(element: FlowEdge<T> = this.element, active = false, offsetX = 0, offsetY = 0, edgeHandle?: FlowEdgeHandleType | null) {
        this.destroyEdge();
        this.nodeG = drawEdge(this.board, this.roughSVG, element, active, offsetX, offsetY, edgeHandle);
        this.g.append(this.nodeG);
    }

    drawHandles(element: FlowEdge<T> = this.element, offsetX = 0, offsetY = 0, edgeHandle?: FlowEdgeHandleType | null) {
        this.destroyHandles();
        const handles = drawEdgeHandles(this.board, this.roughSVG, element, offsetX, offsetY, edgeHandle);
        this.handlesG = createG();
        handles.map(item => {
            this.handlesG?.append(item);
        });
        this.g.append(this.handlesG);
    }

    drawRichtext(element: FlowEdge<T> = this.element, textRect: RectangleClient, active = false) {
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

    drawMarkers(element: FlowEdge<T> = this.element, active = false, offsetX = 0, offsetY = 0, edgeHandle?: FlowEdgeHandleType | null) {
        this.destroyMarkers();
        this.sourceMarkerG = drawEdgeMarkers(this.board, this.roughSVG, element, active, offsetX, offsetY, edgeHandle);
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

    destroyEdge() {
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
            this.sourceMarkerG = null;
        }
    }
}
