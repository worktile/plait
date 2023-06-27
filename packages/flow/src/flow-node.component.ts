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
import {
    PlaitPluginElementComponent,
    PlaitPluginElementContext,
    PlaitBoard,
    normalizePoint,
    createG,
    OnContextChanged,
    drawCircle,
    Point
} from '@plait/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { drawNodeHandles } from './draw/handle';
import { drawActiveMask, drawNode } from './draw/node';
import { FlowNode } from './interfaces/node';
import { FlowBaseData, FlowPosition } from './interfaces/element';
import { DEFAULT_HANDLE_STYLES, HANDLE_BUFFER, HANDLE_DIAMETER } from './constants/handle';

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
        this.drawElement();
        this.drawRichtext();
    }

    onContextChanged(value: PlaitPluginElementContext<FlowNode, PlaitBoard>, previous: PlaitPluginElementContext<FlowNode, PlaitBoard>) {
        if (value.element !== previous.element && this.initialized) {
            this.updateElement(value.element, value.selected);
        }
        if (this.initialized) {
            if (value.selected) {
                this.setActiveNodeToTop();
                this.drawActiveMask();
                this.drawHandles();
            } else {
                this.destroyActiveMask();
                this.destroyHandles();
            }
        }
    }

    setActiveNodeToTop() {
        const parentElement = this.g.parentElement;
        this.g.remove();
        parentElement?.append(this.g);
    }

    drawElement(element: FlowNode = this.element) {
        this.destroyElement();
        this.nodeG = drawNode(this.roughSVG, element);
        this.g.append(this.nodeG);
    }

    drawActiveMask(element: FlowNode = this.element) {
        this.destroyActiveMask();
        this.activeMaskG = drawActiveMask(this.roughSVG, element);
        this.g.prepend(this.activeMaskG);
    }

    drawRichtext(element: FlowNode = this.element) {
        this.destroyRichtext();
        if (element.data?.text) {
            this.textManage.draw(element.data.text);
            this.textManage.g.classList.add('flow-node-richtext');
            this.g.append(this.textManage.g);
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
        this.g.append(this.handlesG);
    }

    drawActiveHandle(point: Point, position: FlowPosition) {
        const hoveredHandleClass = `flow-hover-handle-${position}`;
        if (!this.g.querySelector(`.${hoveredHandleClass}`)) {
            const hoverHandle = drawCircle(this.roughSVG, point, HANDLE_DIAMETER + HANDLE_BUFFER, {
                ...DEFAULT_HANDLE_STYLES,
                stroke: 'rgba(102, 152, 255, 0.3)',
                strokeWidth: HANDLE_BUFFER
            });
            this.render2.addClass(hoverHandle, hoveredHandleClass);
            this.render2.addClass(hoverHandle, 'flow-hover-handle');
            this.g.append(hoverHandle);
        }
    }

    removeActiveHandle(position: FlowPosition) {
        const hoveredHandleClass = `flow-hover-handle-${position}`;
        const hoveredHandle = this.g.querySelector(`.${hoveredHandleClass}`);
        hoveredHandle?.remove();
    }

    updateElement(element: FlowNode = this.element, isActive = false) {
        this.drawElement(element);
        this.drawRichtext(element);
        if (isActive) {
            this.drawActiveMask(element);
            this.drawHandles(element);
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
