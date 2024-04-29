import { ChangeDetectionStrategy, Component, NgZone, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { PlaitPluginElementContext, getElementById } from '@plait/core';
import { PlaitBoard, OnContextChanged } from '@plait/core';
import { TextManage } from '@plait/text';
import { EdgeStableState, FlowEdge } from './interfaces/edge';
import { FlowBaseData } from './interfaces/element';
import { PlaitFlowBoard } from './interfaces';
import { EdgeLabelSpace, renderEdge } from './utils';
import { FlowNode } from './interfaces/node';
import { EdgeGenerator } from './generators/edge-generator';
import { CommonPluginElement } from '@plait/common';
import { EdgeElementRef } from './core/edge-ref';
import { EdgeLabelGenerator } from './generators/edge-label-generator';

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

    edgeLabelGenerator!: EdgeLabelGenerator;

    boundedElements!: BoundedElements;

    constructor(public render2: Renderer2, public ngZone: NgZone) {
        const edgeElementRef = new EdgeElementRef();
        super(edgeElementRef);
    }

    initializeGenerator() {
        const textManage = new TextManage(this.board, this.viewContainerRef, {
            getRectangle: () => {
                return EdgeLabelSpace.getLabelTextRectangle(this.board, this.element);
            }
        });
        this.edgeGenerator = new EdgeGenerator(this.board, this.viewContainerRef);
        this.edgeLabelGenerator = new EdgeLabelGenerator(this.board, this.viewContainerRef, textManage);
        this.getRef().addGenerator<EdgeGenerator>(EdgeGenerator.key, this.edgeGenerator);
        this.getRef().addGenerator<EdgeLabelGenerator>(EdgeLabelGenerator.key, this.edgeLabelGenerator);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.getRef().setState(this.context.selected ? EdgeStableState.active : EdgeStableState['']);
        this.initializeGenerator();
        this.getRef().buildPathPoints(this.board, this.element);
        renderEdge(this.board, this.element, this.getRef().getState());
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
            const currentState = this.getRef().getState();
            this.getRef().setState(
                value.selected
                    ? EdgeStableState.active
                    : currentState === EdgeStableState.highlight
                    ? EdgeStableState.highlight
                    : EdgeStableState['']
            );
            renderEdge(this.board, this.element, this.getRef().getState());
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

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.edgeGenerator.destroy();
        this.edgeLabelGenerator.destroy();
    }
}
