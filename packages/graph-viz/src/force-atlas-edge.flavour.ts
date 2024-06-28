import { CommonElementFlavour } from '@plait/common';
import { OnContextChanged, PlaitBoard, PlaitPluginElementContext } from '@plait/core';
import Graph from 'graphology';
import { ForceAtlasEdgeElement } from './interfaces';
import { ForceEdgeAtlasGenerator } from './force-atlas/generators/edge.generator';

export class ForceAtlasEdgeFlavour extends CommonElementFlavour<ForceAtlasEdgeElement, PlaitBoard>
    implements OnContextChanged<ForceAtlasEdgeElement, PlaitBoard> {
    graph!: Graph<Node>;
    edgeGenerator!: ForceEdgeAtlasGenerator;

    constructor() {
        super();
    }

    initializeGenerator() {
        this.edgeGenerator = new ForceEdgeAtlasGenerator(this.board);
    }

    initialize(): void {
        super.initialize();
        this.initializeGenerator();
        const g = this.getElementG();
        this.edgeGenerator.processDrawing(this.element, PlaitBoard.getElementLowerHost(this.board));
    }

    onContextChanged(
        value: PlaitPluginElementContext<ForceAtlasEdgeElement, PlaitBoard>,
        previous: PlaitPluginElementContext<ForceAtlasEdgeElement, PlaitBoard>
    ) {
        // getRelatedNode()
        this.selected;
    }

    updateText(previousElement: ForceAtlasEdgeElement, currentElement: ForceAtlasEdgeElement) {}

    destroy(): void {
        super.destroy();
    }
}
