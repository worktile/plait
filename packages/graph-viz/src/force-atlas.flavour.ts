import { CommonElementFlavour } from '@plait/common';
import { OnContextChanged, PlaitBoard, PlaitPluginElementContext } from '@plait/core';
import Graph from 'graphology';
import circular from 'graphology-layout/circular';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import { ForceAtlasElement, ForceAtlasNodeElement } from './interfaces';
import { DEFAULT_ACTIVE_BACKGROUND_NODE_SIZE, DEFAULT_NODE_SCALING_RATIO, DEFAULT_NODE_SIZE } from './force-atlas/constants';

export class ForceAtlasFlavour extends CommonElementFlavour<ForceAtlasElement, PlaitBoard>
    implements OnContextChanged<ForceAtlasElement, PlaitBoard> {
    graph!: Graph<ForceAtlasNodeElement>;

    constructor() {
        super();
    }

    initializeGraph() {
        this.graph = new Graph<ForceAtlasNodeElement>();
        this.element.children?.forEach(child => {
            if (ForceAtlasElement.isForceAtlasNodeElement(child)) {
                if (typeof child?.size === 'undefined') {
                    child.size = (child.isActive ? DEFAULT_ACTIVE_BACKGROUND_NODE_SIZE : DEFAULT_NODE_SIZE) * 2;
                }
                // 添加节点信息
                this.graph.addNode(child.id, child);
            } else if (ForceAtlasElement.isForceAtlasEdgeElement(child)) {
                // 添加节点关联关系
                this.graph.addEdge(child.source, child.target);
            }
        });
        circular.assign(this.graph);
        const settings = forceAtlas2.inferSettings(this.graph);
        settings.adjustSizes = true;
        settings.scalingRatio = DEFAULT_NODE_SCALING_RATIO; // 增加节点之间的距离
        settings.barnesHutOptimize = true;
        const positions = forceAtlas2(this.graph, { iterations: 500, settings });
        this.element.children?.forEach(child => {
            if (ForceAtlasElement.isForceAtlasNodeElement(child)) {
                const pos = positions[child.id];
                // 绑定计算后的位置
                child.points = [[pos.x, pos.y]];
            }
        });
    }

    initialize(): void {
        super.initialize();
        this.initializeGraph();
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
