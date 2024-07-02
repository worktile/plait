import { CommonElementFlavour } from '@plait/common';
import { OnContextChanged, PlaitBoard, PlaitPluginElementContext, cacheSelectedElements } from '@plait/core';
import Graph from 'graphology';
import { ForceAtlasNodeElement } from '../interfaces';
import { ForceAtlasNodeGenerator } from './generators/node.generator';
import { ForceActiveNodeAtlasGenerator } from './generators/node-active.generator';
import { getEdgeGenerator, getEdgeInfoByEdge, getEdgesInSourceOrTarget } from './utils/edge';
import { getAssociatedNodesById, getNodeGenerator } from './utils/node';

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
            const parent = value.parent as any;
            if (value.selected) {
                cacheSelectedElements(this.board, [value.element]);
            }
            this.nodeActiveGenerator.destroy();
            const associatedNodes = getAssociatedNodesById(value.element.id, parent);
            associatedNodes.forEach(node => {
                const nodeGenerator = getNodeGenerator(node);
                nodeGenerator.destroy();
                if (value.selected && node.id === value.element.id) {
                    this.nodeActiveGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board));
                } else {
                    nodeGenerator.processDrawing(node, this.getElementG());
                }
            });

            const associatedEdges = getEdgesInSourceOrTarget(value.element.id, parent);
            associatedEdges.forEach(edge => {
                const edgeGenerator = getEdgeGenerator(edge);
                edgeGenerator.destroy();
                edgeGenerator.processDrawing(edge, this.getElementG(), getEdgeInfoByEdge(edge, this.board));
            });
        }
    }

    updateText(previousElement: ForceAtlasNodeElement, currentElement: ForceAtlasNodeElement) {}

    destroy(): void {
        super.destroy();
    }
}
