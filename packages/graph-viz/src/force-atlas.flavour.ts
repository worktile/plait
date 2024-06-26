import { CommonElementFlavour } from '@plait/common';
import { OnContextChanged, PlaitBoard, PlaitPluginElementContext } from '@plait/core';
import Graph from 'graphology';
import circular from 'graphology-layout/circular';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import { NodeForceAtlasGenerator } from './force-atlas/generators/node.generator';
import { ForceAtlasElement } from './interfaces';
import { Node, Positions } from './force-atlas/types';
import { EdgeForceAtlasGenerator } from './force-atlas/generators/edge.generator';
import { DEFAULT_ACTIVE_BACKGROUND_NODE_SIZE, DEFAULT_NODE_SCALING_RATIO, DEFAULT_NODE_SIZE } from './force-atlas/constants';

export class ForceAtlasFlavour extends CommonElementFlavour<ForceAtlasElement, PlaitBoard>
    implements OnContextChanged<ForceAtlasElement, PlaitBoard> {
    graph!: Graph<Node>;
    graphPositions: Positions = {};
    nodeGenerator!: NodeForceAtlasGenerator;
    edgeGenerator!: EdgeForceAtlasGenerator;

    constructor() {
        super();
    }

    initializeGraph() {
        this.graph = new Graph<Node>();
        this.element.nodes.forEach(node => {
            if (typeof node.size === 'undefined') {
                node.size = (node.isActive ? DEFAULT_ACTIVE_BACKGROUND_NODE_SIZE : DEFAULT_NODE_SIZE) * 2;
            }
            // 添加节点信息
            this.graph.addNode(node.id, node);
        });
        this.element.edges.forEach(edge => {
            // 添加节点关联关系
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
        this.nodeGenerator = new NodeForceAtlasGenerator(this.board, this.graph, this.graphPositions);
        this.edgeGenerator = new EdgeForceAtlasGenerator(this.board, this.graph, this.graphPositions);
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
        value: PlaitPluginElementContext<ForceAtlasElement, PlaitBoard>,
        previous: PlaitPluginElementContext<ForceAtlasElement, PlaitBoard>
    ) {}

    updateText(previousElement: ForceAtlasElement, currentElement: ForceAtlasElement) {}

    destroy(): void {
        super.destroy();
    }
}
