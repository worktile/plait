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
import { TextManage } from '@plait/text';
import { PlaitPluginElementComponent, PlaitPluginElementContext, PlaitBoard, normalizePoint, createG, OnContextChanged } from '@plait/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { drawNodeHandles } from './draw/handle';
import { drawActiveMask, drawNode } from './draw/node';
import { FlowNode } from './interfaces/node';
import { FlowBaseData } from './interfaces/element';
import { FlowRenderMode } from './interfaces/flow';
import { setRelationEdgeSelected } from './utils/edge/relation-edge-selected';

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
        this.textManage = new TextManage(this.board, this.viewContainerRef, {
            getRectangle: () => {
                const { x, y } = normalizePoint(this.element.points![0]);
                const width = this.element.width;
                const height = this.element.height;
                return { x, y, width, height };
            }
        });
        this.roughSVG = PlaitBoard.getRoughSVG(this.board);
        this.drawElement();
    }

    onContextChanged(value: PlaitPluginElementContext<FlowNode, PlaitBoard>, previous: PlaitPluginElementContext<FlowNode, PlaitBoard>) {
        if (this.initialized && (value.element !== previous.element || value.selected !== previous.selected)) {
            this.drawElement(value.element, value.selected ? FlowRenderMode.active : FlowRenderMode.default);
        }
        if (previous.selected !== value.selected) {
            if (value.selected) {
                // setTimeout 解决当多个节点关联 edge 有交集时，先执行清空在执行选中操作
                setTimeout(() => {
                    setRelationEdgeSelected(this.board, this.element.id, value.selected);
                }, 0);
            } else {
                setRelationEdgeSelected(this.board, this.element.id, value.selected);
            }
        }
    }

    drawElement(element: FlowNode = this.element, mode: FlowRenderMode = FlowRenderMode.default) {
        // 处理节点高亮当前为 selected 不绘制
        if (this.selected && mode !== FlowRenderMode.active) {
            return;
        }
        this.drawNode(element);
        this.drawRichtext(element);
        this.drawActiveMask(element, mode);
        this.drawHandles(element, mode);

        this.activeG && this.activeG.remove();
        if (mode === FlowRenderMode.default) {
            this.g.append(this.nodeG!);
            this.g.append(this.textManage.g);
        } else {
            this.activeG = createG();
            this.activeG?.append(this.nodeG!);
            this.activeG?.append(this.textManage.g);
            if (mode === FlowRenderMode.active) {
                this.activeG?.prepend(this.activeMaskG!);
            }
            this.activeG?.append(this.handlesG!);
            PlaitBoard.getElementActiveHost(this.board).append(this.activeG!);
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
            this.ngZone.run(() => {
                this.textManage.draw(element.data?.text!);
                this.textManage.g.classList.add('flow-node-richtext');
            });
        }
    }

    drawHandles(element: FlowNode = this.element, mode: FlowRenderMode = FlowRenderMode.default) {
        this.destroyHandles();
        if (mode !== FlowRenderMode.default) {
            this.handlesG = createG();
            const handles = drawNodeHandles(this.roughSVG, element);
            handles.forEach(item => {
                this.handlesG?.append(item);
                this.render2.addClass(item, 'flow-handle');
            });
            this.handlesG?.setAttribute('stroke-linecap', 'round');
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

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.destroyElement();
        this.destroyHandles();
        this.destroyActiveMask();
        this.destroyRichtext();
        this.activeG?.remove();
        this.activeG = null;
    }
}
