import { CommonElementFlavour } from '@plait/common';
import { OnContextChanged, PlaitBoard, PlaitPluginElementContext } from '@plait/core';
import Graph from 'graphology';
import { ForceAtlasEdgeElement } from '../interfaces';
import { ForceAtlasEdgeGenerator } from './generators/edge.generator';
import { getEdgeGeneratorData } from './utils/edge';

export class ForceAtlasEdgeFlavour extends CommonElementFlavour<ForceAtlasEdgeElement, PlaitBoard>
    implements OnContextChanged<ForceAtlasEdgeElement, PlaitBoard> {
    graph!: Graph<Node>;
    edgeGenerator!: ForceAtlasEdgeGenerator;

    constructor() {
        super();
    }

    initializeGenerator() {
        this.edgeGenerator = new ForceAtlasEdgeGenerator(this.board);
        this.getRef().addGenerator(ForceAtlasEdgeGenerator.key, this.edgeGenerator);
    }

    initialize(): void {
        super.initialize();
        this.initializeGenerator();
        this.edgeGenerator.processDrawing(
            this.element,
            PlaitBoard.getElementLowerHost(this.board),
            getEdgeGeneratorData(this.element, this.board)
        );
    }

    onContextChanged(
        value: PlaitPluginElementContext<ForceAtlasEdgeElement, PlaitBoard>,
        previous: PlaitPluginElementContext<ForceAtlasEdgeElement, PlaitBoard>
    ) {}

    updateText(previousElement: ForceAtlasEdgeElement, currentElement: ForceAtlasEdgeElement) {}

    destroy(): void {
        super.destroy();
    }
}
