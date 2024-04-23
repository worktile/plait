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
import { PlaitPluginElementContext, PlaitBoard, normalizePoint, OnContextChanged } from '@plait/core';
import { FlowNode } from './interfaces/node';
import { FlowBaseData } from './interfaces/element';
import { FlowRenderMode } from './interfaces/flow';
import { setRelationEdgeSelected } from './utils/edge/relation-edge-selected';
import { NodeGenerator } from './generators/node.generator';
import { NodeHandleGenerator } from './generators/node-handle.generator';
import { NodeActiveGenerator } from './generators/node-active.generator';
import { CommonPluginElement } from '@plait/common';

@Component({
    selector: 'plait-flow-node',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class FlowNodeComponent<T extends FlowBaseData = FlowBaseData> extends CommonPluginElement<FlowNode<T>>
    implements OnInit, OnContextChanged<FlowNode, PlaitBoard>, OnDestroy {
    nodeGenerator!: NodeGenerator;
    nodeHandleGenerator!: NodeHandleGenerator;
    nodeActiveGenerator!: NodeActiveGenerator;
    textManage!: TextManage;

    // roughSVG!: RoughSVG;

    // activeG: SVGGElement | null = null;

    constructor(public viewContainerRef: ViewContainerRef, public render2: Renderer2, public ngZone: NgZone) {
        super();
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.initializeGenerator();
        this.nodeGenerator.processDrawing(this.element, this.getElementG());
        this.drawText();
        // this.roughSVG = PlaitBoard.getRoughSVG(this.board);
        // this.drawElement();
    }

    initializeGenerator() {
        this.nodeGenerator = new NodeGenerator(this.board);
        this.nodeHandleGenerator = new NodeHandleGenerator(this.board);
        this.nodeActiveGenerator = new NodeActiveGenerator(this.board);
        this.textManage = new TextManage(this.board, this.viewContainerRef, {
            getRectangle: () => {
                const { x, y } = normalizePoint(this.element.points![0]);
                const width = this.element.width;
                const height = this.element.height;
                return { x, y, width, height };
            }
        });
        this.getRef().addGenerator<NodeHandleGenerator>(NodeHandleGenerator.key, this.nodeHandleGenerator);
        // this.getRef().addGenerator(NodeEmojisGenerator.key, this.nodeEmojisGenerator);
        // this.getRef().addGenerator(ImageGenerator.key, this.imageGenerator);
    }

    onContextChanged(value: PlaitPluginElementContext<FlowNode, PlaitBoard>, previous: PlaitPluginElementContext<FlowNode, PlaitBoard>) {
        if (this.initialized && (value.element !== previous.element || value.selected !== previous.selected)) {
            this.nodeActiveGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), {
                selected: value.selected
            });
            this.nodeHandleGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), {
                selected: value.selected,
                hovered: false
            });
            this.nodeGenerator.processDrawing(this.element, this.getElementG());
            this.updateText();
            // this.drawElement(value.element, value.selected ? FlowRenderMode.active : FlowRenderMode.default);
        }
        // if (previous.selected !== value.selected) {
        //     if (value.selected) {
        //         // setTimeout 解决当多个节点关联 edge 有交集时，先执行清空在执行选中操作
        //         setTimeout(() => {
        //             setRelationEdgeSelected(this.board, this.element.id, value.selected);
        //         }, 0);
        //     } else {
        //         setRelationEdgeSelected(this.board, this.element.id, value.selected);
        //     }
        // }
    }

    drawElement(element: FlowNode = this.element, mode: FlowRenderMode = FlowRenderMode.default) {
        // 处理节点高亮当前为 selected 不绘制
        if (this.selected && mode !== FlowRenderMode.active) {
            return;
        }
        // this.drawRichtext(element);
        // this.drawNodeActiveMask(element, mode);
        // this.drawHandles(element, mode);

        // this.activeG && this.activeG.remove();
        if (mode === FlowRenderMode.default) {
            const upperHost = PlaitBoard.getElementUpperHost(this.board);
            upperHost.append(this.textManage.g);
        } else {
            // this.activeG = createG();
            // this.activeG?.append(this.textManage.g);
            // if (mode === FlowRenderMode.active) {
            //     this.activeG?.prepend(this.activeMaskG!);
            // }
            // this.activeG?.classList.add(ACTIVE_MOVING_CLASS_NAME);
            // PlaitBoard.getElementActiveHost(this.board).append(this.activeG!);
        }
    }

    // drawNodeActiveMask(element: FlowNode = this.element, mode: FlowRenderMode = FlowRenderMode.default) {
    //     this.destroyActiveMask();
    //     if (mode === FlowRenderMode.active) {
    //         this.activeMaskG = drawNodeActiveMask(this.roughSVG, element);
    //     }
    // }

    drawText(element: FlowNode = this.element) {
        const text = this.element.data?.text;
        if (text) {
            this.textManage.draw(text);
            const g = this.textManage.g;
            g.classList.add('flow-node-text');
            this.getElementG().append(g);
        }
    }

    updateText() {
        const text = this.element.data?.text;
        if (text) {
            this.textManage.updateText(text);
            this.textManage.updateRectangle();
        }
    }

    // drawHandles(element: FlowNode = this.element, mode: FlowRenderMode = FlowRenderMode.default) {
    //     this.destroyHandles();
    //     if (mode !== FlowRenderMode.default) {
    //         this.handlesG = createG();
    //         const handles = drawNodeHandles(this.roughSVG, element);
    //         handles.forEach(item => {
    //             this.handlesG?.append(item);
    //             this.render2.addClass(item, 'flow-handle');
    //         });
    //         this.handlesG?.setAttribute('stroke-linecap', 'round');
    //     }
    // }

    // destroyActiveMask() {
    //     if (this.activeMaskG) {
    //         this.activeMaskG.remove();
    //         this.activeMaskG = null;
    //     }
    // }

    destroyRichtext() {
        this.textManage.destroy();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        // this.destroyHandles();
        // this.destroyActiveMask();
        this.destroyRichtext();
        // this.activeG?.remove();
        // this.activeG = null;
    }
}
