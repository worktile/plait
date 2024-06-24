import { CommonElementFlavour } from '@plait/common';
import { OnContextChanged, PlaitBoard, PlaitPluginElementContext } from '@plait/core';
import Graph from 'graphology';
import circular from 'graphology-layout/circular';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import { NodeKnowledgeGraphGenerator } from './generators/knowledge-graph/node.generator';
import { KnowledgeGraphElement, KnowledgeGraphNode, KnowledgeGraphPositions } from './interfaces';
import { DEFAULT_NODE_SCALING_RATIO, DEFAULT_KNOWLEDGE_GRAPH_NODE_SIZE } from './constants/node';
import { EdgeKnowledgeGraphGenerator } from './generators/knowledge-graph/edge.generator';

export class KnowledgeGraphFlavour extends CommonElementFlavour<KnowledgeGraphElement, PlaitBoard>
    implements OnContextChanged<KnowledgeGraphElement, PlaitBoard> {
    graph!: Graph<KnowledgeGraphNode>;
    graphPositions: KnowledgeGraphPositions = {};
    nodeGenerator!: NodeKnowledgeGraphGenerator;
    edgeGenerator!: EdgeKnowledgeGraphGenerator;

    constructor() {
        super();
    }

    initializeGraph() {
        this.graph = new Graph<KnowledgeGraphNode>();
        this.element.nodes.forEach(node => {
            if (typeof node.size === 'undefined') {
                node.size = DEFAULT_KNOWLEDGE_GRAPH_NODE_SIZE * 2;
            }
            this.graph.addNode(node.id, node);
        });
        this.element.edges.forEach(edge => {
            this.graph.addEdge(edge.source, edge.target);
        });
        circular.assign(this.graph);
        const settings = forceAtlas2.inferSettings(this.graph);
        settings.adjustSizes = true;
        settings.scalingRatio = DEFAULT_NODE_SCALING_RATIO; // 增加节点之间的距离
        settings.barnesHutOptimize = true;
        const positions = forceAtlas2(this.graph, { iterations: 500, settings });
        Object.keys(positions).forEach(node => {
            const pos = positions[node];
            this.graphPositions[node] = [pos.x, pos.y];
        });
    }

    initializeGenerator() {
        this.nodeGenerator = new NodeKnowledgeGraphGenerator(this.board, this.graph, this.graphPositions);
        this.edgeGenerator = new EdgeKnowledgeGraphGenerator(this.board, this.graph, this.graphPositions);
    }

    initialize(): void {
        super.initialize();
        this.initializeGraph();
        this.initializeGenerator();
        const g = this.getElementG();
        this.edgeGenerator.processDrawing(this.element, g);
        this.nodeGenerator.processDrawing(this.element, g);
    }

    onContextChanged(
        value: PlaitPluginElementContext<KnowledgeGraphElement, PlaitBoard>,
        previous: PlaitPluginElementContext<KnowledgeGraphElement, PlaitBoard>
    ) {}

    updateText(previousElement: KnowledgeGraphElement, currentElement: KnowledgeGraphElement) {}

    destroy(): void {
        super.destroy();
    }
}
