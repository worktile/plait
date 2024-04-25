import { ChangeDetectionStrategy, Component, NgZone, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ACTIVE_MOVING_CLASS_NAME, PlaitPluginElementContext, getElementById } from '@plait/core';
import { PlaitBoard, OnContextChanged } from '@plait/core';
import { TextManage } from '@plait/text';
import { FlowEdge } from './interfaces/edge';
import { FlowBaseData } from './interfaces/element';
import { PlaitFlowBoard } from './interfaces';
import { EdgeLabelSpace } from './utils';
import { FlowNode } from './interfaces/node';
import { EdgeGenerator } from './generators/edge-generator';
import { CommonPluginElement } from '@plait/common';
import { EdgeElementRef } from './core/edge-ref';

interface BoundedElements {
    source?: FlowNode;
    target?: FlowNode;
}

@Component({
    selector: 'plait-flow-edge',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class FlowEdgeComponent<T extends FlowBaseData = FlowBaseData>
    extends CommonPluginElement<FlowEdge<T>, PlaitFlowBoard, EdgeElementRef>
    implements OnInit, OnContextChanged<FlowEdge, PlaitBoard>, OnDestroy {
    edgeGenerator!: EdgeGenerator;

    handlesG: SVGGElement | null = null;

    textManage!: TextManage;

    boundedElements!: BoundedElements;

    constructor(public render2: Renderer2, public ngZone: NgZone) {
        const edgeElementRef = new EdgeElementRef();
        super(edgeElementRef);
    }

    initializeGenerator() {
        this.textManage = new TextManage(this.board, this.viewContainerRef, {
            getRectangle: () => {
                return EdgeLabelSpace.getLabelTextRectangle(this.board, this.element);
            }
        });
        this.edgeGenerator = new EdgeGenerator(this.board, this.viewContainerRef);
        this.getRef().addGenerator<EdgeGenerator>(EdgeGenerator.key, this.edgeGenerator);
        this.getRef().initializeLabelTextManage(this.textManage);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.initializeGenerator();
        this.getRef().buildPathPoints(this.board, this.element);
        this.edgeGenerator.processDrawing(this.element, this.getElementG(), { selected: false, hovered: false });
        this.drawLabelText();
        this.boundedElements = this.getBoundedElements();
    }

    onContextChanged(value: PlaitPluginElementContext<FlowEdge, PlaitBoard>, previous: PlaitPluginElementContext<FlowEdge, PlaitBoard>) {
        const boundedElements = this.getBoundedElements();
        const isBoundedElementsChanged =
            boundedElements?.source !== this.boundedElements?.source || boundedElements?.target !== this.boundedElements?.target;
        this.boundedElements = boundedElements;
        if (value.element !== previous.element || isBoundedElementsChanged) {
            this.getRef().buildPathPoints(this.board, this.element);
        }
        if (this.initialized && (value.element !== previous.element || value.selected !== previous.selected || isBoundedElementsChanged)) {
            this.edgeGenerator.processDrawing(this.element, this.getElementG(), { selected: value.selected, hovered: false });
            this.updateText();
        }
    }

    getBoundedElements() {
        let boundedElements: BoundedElements = {};
        if (this.element.source?.nodeId) {
            const boundElement = getElementById<FlowNode>(this.board, this.element.source.nodeId);
            if (boundElement) {
                boundedElements.source = boundElement;
            }
        }
        if (this.element.target?.nodeId) {
            const boundElement = getElementById<FlowNode>(this.board, this.element.target.nodeId);
            if (boundElement) {
                boundedElements.target = boundElement;
            }
        }
        return boundedElements;
    }

    drawLabelText() {
        const text = this.element.data?.text;
        if (text) {
            this.textManage.draw(text);
            const g = this.textManage.g;
            g.classList.add('flow-edge-text');
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

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
