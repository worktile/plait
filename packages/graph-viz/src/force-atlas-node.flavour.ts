import { CommonElementFlavour } from '@plait/common';
import { OnContextChanged, PlaitBoard, PlaitPluginElementContext, cacheSelectedElements } from '@plait/core';
import Graph from 'graphology';
import { ForceAtlasNodeElement } from './interfaces';
import { ForceAtlasNodeGenerator } from './force-atlas/generators/node.generator';
import { ForceActiveNodeAtlasGenerator } from './force-atlas/generators/node-active.generator';
import { getEdgeGenerator, getEdgesByNodeId } from './force-atlas/utils/edge';
import { getAssociatedNodesById, getNodeGenerator } from './force-atlas/utils/node';

export class ForceAtlasNodeFlavour extends CommonElementFlavour<ForceAtlasNodeElement, PlaitBoard>
    implements OnContextChanged<ForceAtlasNodeElement, PlaitBoard> {
    graph!: Graph<Node>;
    nodeGenerator!: ForceAtlasNodeGenerator;
    nodeActiveGenerator!: ForceActiveNodeAtlasGenerator;

    constructor() {
        super();
    }

    initializeGenerator() {
        this.nodeGenerator = new ForceAtlasNodeGenerator(this.board);
        this.nodeActiveGenerator = new ForceActiveNodeAtlasGenerator(this.board);
        this.getRef().addGenerator(ForceAtlasNodeGenerator.key, this.nodeGenerator);
    }

    initialize(): void {
        super.initialize();
        this.initializeGenerator();
        if (this.element.isActive) {
            this.nodeActiveGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board));
        } else {
            this.nodeGenerator.processDrawing(this.element, this.getElementG());
        }
    }

    onContextChanged(
        value: PlaitPluginElementContext<ForceAtlasNodeElement, PlaitBoard>,
        previous: PlaitPluginElementContext<ForceAtlasNodeElement, PlaitBoard>
    ) {
        if (value !== previous && value.selected !== previous.selected) {
            if (value.selected) {
                cacheSelectedElements(this.board, [value.element]);
            }
            this.nodeActiveGenerator.destroy();
            const associatedNodes = getAssociatedNodesById(value.element.id, value.parent as any);
            associatedNodes.forEach(node => {
                const nodeGenerator = getNodeGenerator(node);
                nodeGenerator.destroy();
                if (value.selected && node.id === value.element.id) {
                    this.nodeActiveGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board));
                } else {
                    nodeGenerator.processDrawing(node, this.getElementG());
                }
            });
            const associatedEdges = getEdgesByNodeId(value.element.id, value.parent as any);
            associatedEdges.forEach(edge => {
                const edgeGenerator = getEdgeGenerator(edge);
                edgeGenerator.destroy();
                edgeGenerator.processDrawing(edge, this.getElementG());
            });
        }
    }

    updateText(previousElement: ForceAtlasNodeElement, currentElement: ForceAtlasNodeElement) {}

    destroy(): void {
        super.destroy();
    }
}
