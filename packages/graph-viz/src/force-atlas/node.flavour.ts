import { CommonElementFlavour } from '@plait/common';
import {
    OnContextChanged,
    PlaitBoard,
    PlaitNode,
    PlaitPluginElementContext,
    cacheSelectedElements,
    getSelectedElements
} from '@plait/core';
import Graph from 'graphology';
import { ForceAtlasElement, ForceAtlasNodeElement } from '../interfaces';
import { ForceAtlasNodeGenerator } from './generators/node.generator';
import { getEdgeGenerator, getEdgeGeneratorData, getEdgesInSourceOrTarget } from './utils/edge';
import { getAssociatedNodesById, getNodeGenerator, isFirstDepthNode } from './utils/node';

export class ForceAtlasNodeFlavour extends CommonElementFlavour<ForceAtlasNodeElement, PlaitBoard>
    implements OnContextChanged<ForceAtlasNodeElement, PlaitBoard> {
    graph!: Graph<Node>;
    nodeGenerator!: ForceAtlasNodeGenerator;

    constructor() {
        super();
    }

    initializeGenerator() {
        this.nodeGenerator = new ForceAtlasNodeGenerator(this.board);
        this.getRef().addGenerator(ForceAtlasNodeGenerator.key, this.nodeGenerator);
    }

    initialize(): void {
        super.initialize();
        this.initializeGenerator();
        const parent = PlaitNode.parent(this.board, PlaitBoard.findPath(this.board, this.element)) as ForceAtlasElement;
        const selectElements = getSelectedElements(this.board);
        const activeNodeId = selectElements[0]?.id;
        const isActive = activeNodeId === this.element.id;
        this.nodeGenerator.processDrawing(this.element, isActive ? PlaitBoard.getElementActiveHost(this.board) : this.getElementG(), {
            isActive,
            isFirstDepth: isFirstDepthNode(this.element.id, activeNodeId, parent)
        });
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
            const selectElements = getSelectedElements(this.board);
            const associatedNodes = getAssociatedNodesById(value.element.id, parent);
            associatedNodes.forEach(node => {
                const nodeGenerator = getNodeGenerator(node);
                nodeGenerator.destroy();
                nodeGenerator.processDrawing(node, this.getElementG(), {
                    isActive: selectElements?.[0]?.id === node.id,
                    isFirstDepth: selectElements.length > 0 && isFirstDepthNode(node.id, selectElements[0].id, parent)
                });
            });

            const associatedEdges = getEdgesInSourceOrTarget(value.element.id, parent);
            associatedEdges.forEach(edge => {
                const edgeGenerator = getEdgeGenerator(edge);
                edgeGenerator.destroy();
                edgeGenerator.processDrawing(edge, PlaitBoard.getElementLowerHost(this.board), getEdgeGeneratorData(edge, this.board));
            });
        }
    }

    updateText(previousElement: ForceAtlasNodeElement, currentElement: ForceAtlasNodeElement) {}

    destroy(): void {
        super.destroy();
    }
}
