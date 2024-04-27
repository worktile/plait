import {
    ChangeDetectionStrategy,
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
import { updateRelatedEdgeHighlight } from './utils/edge/edge-state';
import { NodeGenerator } from './generators/node.generator';
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

    nodeActiveGenerator!: NodeActiveGenerator;

    textManage!: TextManage;

    constructor(public viewContainerRef: ViewContainerRef, public render2: Renderer2, public ngZone: NgZone) {
        super();
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.initializeGenerator();
        this.nodeGenerator.processDrawing(this.element, this.getElementG());
        this.drawText();
    }

    initializeGenerator() {
        this.nodeGenerator = new NodeGenerator(this.board);
        this.nodeActiveGenerator = new NodeActiveGenerator(this.board);
        this.textManage = new TextManage(this.board, this.viewContainerRef, {
            getRectangle: () => {
                const { x, y } = normalizePoint(this.element.points![0]);
                const width = this.element.width;
                const height = this.element.height;
                return { x, y, width, height };
            }
        });
        this.getRef().addGenerator<NodeActiveGenerator>(NodeActiveGenerator.key, this.nodeActiveGenerator);
    }

    onContextChanged(value: PlaitPluginElementContext<FlowNode, PlaitBoard>, previous: PlaitPluginElementContext<FlowNode, PlaitBoard>) {
        if (this.initialized && (value.element !== previous.element || value.selected !== previous.selected)) {
            this.nodeActiveGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), {
                selected: value.selected,
                hovered: false
            });
            this.nodeGenerator.processDrawing(this.element, this.getElementG());
            this.updateText();
        }
        if (previous.selected !== value.selected) {
            if (value.selected) {
                // setTimeout 解决当多个节点关联 edge 有交集时，先执行清空在执行选中操作
                setTimeout(() => {
                    updateRelatedEdgeHighlight(this.board, this.element.id, true);
                }, 0);
            } else {
                updateRelatedEdgeHighlight(this.board, this.element.id, false);
            }
        }
    }

    drawText(element: FlowNode = this.element) {
        const text = this.element.data?.text;
        if (text) {
            this.textManage.draw(text);
            const g = this.textManage.g;
            g.classList.add('flow-node-richtext');
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

    destroyText() {
        this.textManage.destroy();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.destroyText();
    }
}
