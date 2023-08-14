import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, Renderer2, ViewContainerRef } from '@angular/core';
import { TextManage } from '@plait/text';
import { PlaitPluginElementComponent, PlaitPluginElementContext, PlaitBoard, normalizePoint, createG, OnContextChanged } from '@plait/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { drawNodeHandles } from './draw/handle';
import { drawActiveMask, drawNode } from './draw/node';
import { FlowNode } from './interfaces/node';
import { FlowBaseData } from './interfaces/element';
import { FlowRenderMode } from './public-api';

@Component({
    selector: 'plait-flow-node',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlowNodeComponent<T extends FlowBaseData = FlowBaseData> extends PlaitPluginElementComponent<FlowNode<T>>
    implements OnInit, OnContextChanged<FlowNode, PlaitBoard>, OnDestroy {
    nodeG: SVGGElement | null = null;

    activeMaskG: SVGGElement | null = null;

    roughSVG!: RoughSVG;

    textManage!: TextManage;

    handlesG: SVGGElement | null = null;

    activeG: SVGGElement | null = null;

    constructor(public cdr: ChangeDetectorRef, public viewContainerRef: ViewContainerRef, public render2: Renderer2) {
        super(cdr);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.textManage = new TextManage(this.board, this.viewContainerRef, () => {
            const { x, y } = normalizePoint(this.element.points![0]);
            const width = this.element.width;
            const height = this.element.height;
            return { x, y, width, height };
        });
        this.roughSVG = PlaitBoard.getRoughSVG(this.board);
        this.activeG = createG();
        this.drawElement();
    }

    onContextChanged(value: PlaitPluginElementContext<FlowNode, PlaitBoard>, previous: PlaitPluginElementContext<FlowNode, PlaitBoard>) {
        if (value.element !== previous.element && this.initialized) {
            this.drawElement(value.element, value.selected ? FlowRenderMode.active : FlowRenderMode.default);
        }
        if (value.selected) {
            this.drawElement(this.element, value.selected ? FlowRenderMode.active : FlowRenderMode.default);
        } else if (this.initialized) {
            if (previous.selected) {
                this.destroyActiveMask();
                this.destroyHandles();
            }
        }
    }

    drawElement(element: FlowNode = this.element, mode: FlowRenderMode = FlowRenderMode.default) {
        this.getElement(element, mode);
        if (mode === FlowRenderMode.default) {
            this.g.append(this.nodeG!);
            this.g.append(this.textManage.g);
            this.activeG?.remove();
        } else {
            this.activeG?.append(this.nodeG!);
            this.activeG?.append(this.textManage.g);
            if (mode === FlowRenderMode.active) {
                this.activeG?.prepend(this.activeMaskG!);
            }
            this.activeG?.append(this.handlesG!);
            PlaitBoard.getElementHostActive(this.board).append(this.activeG!);
        }
    }

    drawNode(element: FlowNode = this.element) {
        this.destroyElement();
        this.nodeG = drawNode(this.roughSVG, element);
    }

    drawActiveMask(element: FlowNode = this.element, mode: FlowRenderMode = FlowRenderMode.default) {
        this.destroyActiveMask();
        if (mode === FlowRenderMode.active) {
            this.activeMaskG = drawActiveMask(this.roughSVG, element);
        }
    }

    drawRichtext(element: FlowNode = this.element) {
        this.destroyRichtext();
        if (element.data?.text) {
            this.textManage.draw(element.data.text);
            this.textManage.g.classList.add('flow-node-richtext');
        }
    }

    drawHandles(element: FlowNode = this.element, mode: FlowRenderMode = FlowRenderMode.default) {
        if (mode !== FlowRenderMode.default) {
            this.destroyHandles();
            const handles = drawNodeHandles(this.roughSVG, element);
            this.handlesG = createG();
            handles.map(item => {
                this.handlesG?.append(item);
                this.render2.addClass(item, 'flow-handle');
            });
            this.handlesG?.setAttribute('stroke-linecap', 'round');
        }
    }

    getElement(element: FlowNode = this.element, mode: FlowRenderMode = FlowRenderMode.default) {
        this.drawNode(element);
        this.drawRichtext(element);
        this.drawActiveMask(element, mode);
        this.drawHandles(element, mode);
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
        this.textManage.destroy();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.activeG?.remove();
        this.activeG = null;
    }
}
