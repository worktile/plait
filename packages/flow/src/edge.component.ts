import { PlaitPluginElementContext, getElementById } from '@plait/core';
import { PlaitBoard, OnContextChanged } from '@plait/core';
import { EdgeStableState, FlowEdge } from './interfaces/edge';
import { FlowBaseData } from './interfaces/element';
import { EdgeLabelSpace, renderEdge } from './utils';
import { FlowNode } from './interfaces/node';
import { EdgeGenerator } from './generators/edge-generator';
import { CommonElementFlavour, TextManage } from '@plait/common';
import { EdgeElementRef } from './core/edge-ref';
import { EdgeLabelGenerator } from './generators/edge-label-generator';

interface BoundedElements {
    source?: FlowNode;
    target?: FlowNode;
}

export class FlowEdgeComponent<T extends FlowBaseData = FlowBaseData> extends CommonElementFlavour<FlowEdge<T>, PlaitBoard, EdgeElementRef>
    implements OnContextChanged<FlowEdge, PlaitBoard> {
    edgeGenerator!: EdgeGenerator;

    edgeLabelGenerator!: EdgeLabelGenerator;

    boundedElements!: BoundedElements;

    constructor() {
        const edgeElementRef = new EdgeElementRef();
        super(edgeElementRef);
    }

    initializeGenerator() {
        const textManage = new TextManage(this.board, {
            getRectangle: () => {
                return EdgeLabelSpace.getLabelTextRectangle(this.board, this.element);
            },
            textPlugins: []
        });
        this.edgeGenerator = new EdgeGenerator(this.board);
        this.edgeLabelGenerator = new EdgeLabelGenerator(this.board, textManage);
        this.getRef().addGenerator<EdgeGenerator>(EdgeGenerator.key, this.edgeGenerator);
        this.getRef().addGenerator<EdgeLabelGenerator>(EdgeLabelGenerator.key, this.edgeLabelGenerator);
    }

    initialize(): void {
        super.initialize();
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

    destroy(): void {
        super.destroy();
        this.edgeGenerator.destroy();
        this.edgeLabelGenerator.destroy();
    }
}
