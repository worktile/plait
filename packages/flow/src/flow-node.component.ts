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
import { TextManage } from '@plait/text';
import { PlaitPluginElementComponent, PlaitPluginElementContext, PlaitBoard, normalizePoint, createG, OnContextChanged } from '@plait/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { drawNodeHandles } from './draw/handle';
import { drawActiveMask, drawNode } from './draw/node';
import { FlowNode } from './interfaces/node';
import { FlowBaseData } from './interfaces/element';
import { addNodeActive, removeNodeActive } from './public-api';

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

    hostActiveG!: SVGGElement;

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
        this.hostActiveG = PlaitBoard.getElementHostActive(this.board);
        this.drawElementHost();
    }

    onContextChanged(value: PlaitPluginElementContext<FlowNode, PlaitBoard>, previous: PlaitPluginElementContext<FlowNode, PlaitBoard>) {
        if (value.element !== previous.element && this.initialized) {
            this.drawElementHost(value.element, value.selected);
        }
        if (this.initialized) {
            if (value.selected) {
                addNodeActive(this.element, value.selected);
            } else if (previous.selected) {
                this.destroyActiveMask();
                this.destroyHandles();
            }
        }
    }

    drawElementHost(element: FlowNode = this.element, active = false) {
        this.updateElement(element, active);
        this.g.append(this.nodeG!);
        this.g.append(this.textManage!.g);
        if (active) {
            this.g.prepend(this.activeMaskG!);
            this.g.append(this.handlesG!);
        }
    }

    drawElementHostActive(element: FlowNode = this.element, active = true) {
        this.updateElement(element, active);
        this.hostActiveG.append(this.nodeG!);
        this.hostActiveG.append(this.textManage!.g);
        if (active) {
            this.hostActiveG.prepend(this.activeMaskG!);
            this.hostActiveG.append(this.handlesG!);
        }
    }

    getNodeElement(element: FlowNode = this.element) {
        this.destroyElement();
        this.nodeG = drawNode(this.roughSVG, element);
    }

    drawActiveMask(element: FlowNode = this.element) {
        this.destroyActiveMask();
        this.activeMaskG = drawActiveMask(this.roughSVG, element);
    }

    drawRichtext(element: FlowNode = this.element) {
        this.destroyRichtext();
        if (element.data?.text) {
            this.textManage.draw(element.data.text);
            this.textManage.g.classList.add('flow-node-richtext');
        }
    }

    drawHandles(element: FlowNode = this.element) {
        this.destroyHandles();
        const handles = drawNodeHandles(this.roughSVG, element);
        this.handlesG = createG();
        handles.map(item => {
            this.handlesG?.append(item);
            this.render2.addClass(item, 'flow-handle');
        });
        this.handlesG?.setAttribute('stroke-linecap', 'round');
        this.hostActiveG.append(this.handlesG);
    }

    updateElement(element: FlowNode = this.element, isActive = false) {
        this.getNodeElement(element);
        this.drawRichtext(element);
        if (isActive) {
            this.drawActiveMask(element);
            this.drawHandles(element);
        } else {
            this.destroyActiveMask();
            this.destroyHandles();
        }
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
}
