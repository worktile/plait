import { CommonElementFlavour } from '@plait/common';
import { OnContextChanged, PlaitBoard, PlaitPluginElementContext } from '@plait/core';
import Graph from 'graphology';
import { ForceAtlasNodeElement } from './interfaces';
import { ForceNodeAtlasGenerator } from './force-atlas/generators/node.generator';

export class ForceAtlasNodeFlavour extends CommonElementFlavour<ForceAtlasNodeElement, PlaitBoard>
    implements OnContextChanged<ForceAtlasNodeElement, PlaitBoard> {
    graph!: Graph<Node>;
    nodeGenerator!: ForceNodeAtlasGenerator;

    constructor() {
        super();
    }

    initializeGenerator() {
        this.nodeGenerator = new ForceNodeAtlasGenerator(this.board);
    }

    initialize(): void {
        super.initialize();
        this.initializeGenerator();
        const g = this.getElementG();
        this.nodeGenerator.processDrawing(this.element, g);
    }

    onContextChanged(
        value: PlaitPluginElementContext<ForceAtlasNodeElement, PlaitBoard>,
        previous: PlaitPluginElementContext<ForceAtlasNodeElement, PlaitBoard>
    ) {
        // getRelatedNode()
        this.selected;
    }

    updateText(previousElement: ForceAtlasNodeElement, currentElement: ForceAtlasNodeElement) {}

    destroy(): void {
        super.destroy();
    }
}
